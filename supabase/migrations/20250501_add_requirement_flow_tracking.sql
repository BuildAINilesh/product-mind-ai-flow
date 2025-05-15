-- Create requirement_flow_tracking table to track the progress of requirements through the flow
CREATE TABLE IF NOT EXISTS public.requirement_flow_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
    current_stage TEXT NOT NULL DEFAULT 'requirement_capture',
    requirement_capture_status TEXT NOT NULL DEFAULT 'draft', -- draft, complete
    analysis_status TEXT DEFAULT NULL, -- null, draft, complete
    market_sense_status TEXT DEFAULT NULL, -- null, market_draft, market_complete
    validator_status TEXT DEFAULT NULL, -- null, validation_draft, validation_complete
    case_generator_status TEXT DEFAULT NULL, -- null, case_draft, case_complete
    brd_status TEXT DEFAULT NULL, -- null, draft, ready, signed_off, rejected
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT requirement_flow_valid_current_stage CHECK (
        current_stage IN ('requirement_capture', 'analysis', 'market_sense', 'validator', 'case_generator', 'brd')
    ),
    CONSTRAINT requirement_flow_valid_requirement_capture_status CHECK (
        requirement_capture_status IN ('draft', 'complete')
    ),
    CONSTRAINT requirement_flow_valid_analysis_status CHECK (
        analysis_status IS NULL OR analysis_status IN ('draft', 'complete')
    ),
    CONSTRAINT requirement_flow_valid_market_sense_status CHECK (
        market_sense_status IS NULL OR market_sense_status IN ('market_draft', 'market_complete')
    ),
    CONSTRAINT requirement_flow_valid_validator_status CHECK (
        validator_status IS NULL OR validator_status IN ('validation_draft', 'validation_complete')
    ),
    CONSTRAINT requirement_flow_valid_case_generator_status CHECK (
        case_generator_status IS NULL OR case_generator_status IN ('case_draft', 'case_complete')
    ),
    CONSTRAINT requirement_flow_valid_brd_status CHECK (
        brd_status IS NULL OR brd_status IN ('draft', 'ready', 'signed_off', 'rejected')
    )
);

-- Add comment to the table
COMMENT ON TABLE public.requirement_flow_tracking IS 'Tracks the flow of requirements through the product mind AI flow stages';

-- Create index on requirement_id for better query performance
CREATE INDEX IF NOT EXISTS requirement_flow_tracking_requirement_id_idx ON public.requirement_flow_tracking(requirement_id);

-- Enable Row Level Security
ALTER TABLE public.requirement_flow_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "mcp_view_flow_tracking_policy" 
ON public.requirement_flow_tracking
FOR SELECT 
USING (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role'
);

CREATE POLICY "mcp_insert_flow_tracking_policy" 
ON public.requirement_flow_tracking
FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role'
);

CREATE POLICY "mcp_update_flow_tracking_policy" 
ON public.requirement_flow_tracking
FOR UPDATE 
USING (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role'
)
WITH CHECK (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role'
);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_requirement_flow_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_requirement_flow_tracking_timestamp
BEFORE UPDATE ON public.requirement_flow_tracking
FOR EACH ROW EXECUTE PROCEDURE update_requirement_flow_tracking_updated_at();

-- Trigger to create flow tracking entry when a new requirement is created
CREATE OR REPLACE FUNCTION create_flow_tracking_for_new_requirement()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.requirement_flow_tracking (requirement_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_flow_tracking_on_requirement_insert
AFTER INSERT ON public.requirements
FOR EACH ROW EXECUTE PROCEDURE create_flow_tracking_for_new_requirement();

-- Populate flow tracking entries for existing requirements
INSERT INTO public.requirement_flow_tracking (
    requirement_id,
    current_stage,
    requirement_capture_status,
    is_completed
)
SELECT 
    id,
    CASE
        WHEN status = 'Draft' OR status = 'Re_Draft' THEN 'requirement_capture'
        WHEN status = 'Completed' THEN 'analysis'
        ELSE 'requirement_capture'
    END,
    CASE
        WHEN status = 'Completed' THEN 'complete'
        ELSE 'draft'
    END,
    false
FROM
    public.requirements
WHERE
    id NOT IN (SELECT requirement_id FROM public.requirement_flow_tracking);

-- Function to validate and enforce sequential flow
CREATE OR REPLACE FUNCTION validate_requirement_flow_progression()
RETURNS TRIGGER AS $$
DECLARE
    old_stage TEXT;
    new_stage TEXT;
    previous_stage_complete BOOLEAN;
BEGIN
    -- Get the old and new stages
    old_stage := OLD.current_stage;
    new_stage := NEW.current_stage;
    
    -- If the stage hasn't changed, no validation needed
    IF old_stage = new_stage THEN
        RETURN NEW;
    END IF;
    
    -- Check if trying to skip stages
    IF (old_stage = 'requirement_capture' AND new_stage NOT IN ('requirement_capture', 'analysis')) OR
       (old_stage = 'analysis' AND new_stage NOT IN ('analysis', 'market_sense')) OR
       (old_stage = 'market_sense' AND new_stage NOT IN ('market_sense', 'validator')) OR
       (old_stage = 'validator' AND new_stage NOT IN ('validator', 'case_generator')) OR
       (old_stage = 'case_generator' AND new_stage NOT IN ('case_generator', 'brd')) THEN
        RAISE EXCEPTION 'Cannot skip stages in the requirement flow. Sequential progression is required.';
    END IF;
    
    -- Check if the previous stage is complete before moving to the next
    previous_stage_complete := CASE
        WHEN old_stage = 'requirement_capture' THEN OLD.requirement_capture_status = 'complete'
        WHEN old_stage = 'analysis' THEN OLD.analysis_status = 'complete'
        WHEN old_stage = 'market_sense' THEN OLD.market_sense_status = 'market_complete'
        WHEN old_stage = 'validator' THEN OLD.validator_status = 'validation_complete'
        WHEN old_stage = 'case_generator' THEN OLD.case_generator_status = 'case_complete'
        ELSE FALSE
    END;
    
    IF NOT previous_stage_complete AND old_stage != new_stage THEN
        RAISE EXCEPTION 'Cannot proceed to next stage until current stage (%) is complete', old_stage;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_sequential_flow
BEFORE UPDATE ON public.requirement_flow_tracking
FOR EACH ROW EXECUTE PROCEDURE validate_requirement_flow_progression();

-- Create functions for each stage transition to simplify client usage

-- Function to complete the Requirement Capture stage and move to Analysis
CREATE OR REPLACE FUNCTION complete_requirement_capture(req_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.requirement_flow_tracking
    SET 
        requirement_capture_status = 'complete',
        current_stage = 'analysis',
        analysis_status = 'draft'
    WHERE 
        requirement_id = req_id AND
        current_stage = 'requirement_capture';
END;
$$ LANGUAGE plpgsql;

-- Function to complete the Analysis stage and move to Market Sense
CREATE OR REPLACE FUNCTION complete_analysis(req_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.requirement_flow_tracking
    SET 
        analysis_status = 'complete',
        current_stage = 'market_sense',
        market_sense_status = 'market_draft'
    WHERE 
        requirement_id = req_id AND
        current_stage = 'analysis';
END;
$$ LANGUAGE plpgsql;

-- Function to complete the Market Sense stage and move to Validator
CREATE OR REPLACE FUNCTION complete_market_sense(req_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.requirement_flow_tracking
    SET 
        market_sense_status = 'market_complete',
        current_stage = 'validator',
        validator_status = 'validation_draft'
    WHERE 
        requirement_id = req_id AND
        current_stage = 'market_sense';
END;
$$ LANGUAGE plpgsql;

-- Function to complete the Validator stage and move to Case Generator
CREATE OR REPLACE FUNCTION complete_validator(req_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.requirement_flow_tracking
    SET 
        validator_status = 'validation_complete',
        current_stage = 'case_generator',
        case_generator_status = 'case_draft'
    WHERE 
        requirement_id = req_id AND
        current_stage = 'validator';
END;
$$ LANGUAGE plpgsql;

-- Function to complete the Case Generator stage and move to BRD
CREATE OR REPLACE FUNCTION complete_case_generator(req_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.requirement_flow_tracking
    SET 
        case_generator_status = 'case_complete',
        current_stage = 'brd',
        brd_status = 'draft'
    WHERE 
        requirement_id = req_id AND
        current_stage = 'case_generator';
END;
$$ LANGUAGE plpgsql;

-- Function to complete the BRD stage (signed_off)
CREATE OR REPLACE FUNCTION complete_brd(req_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.requirement_flow_tracking
    SET 
        brd_status = 'signed_off',
        is_completed = TRUE
    WHERE 
        requirement_id = req_id AND
        current_stage = 'brd';
END;
$$ LANGUAGE plpgsql; 