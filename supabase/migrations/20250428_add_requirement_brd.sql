-- Create requirement_brd table for AI Signoff module
CREATE TABLE IF NOT EXISTS public.requirement_brd (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, ready, signed_off, rejected, error
    brd_document JSONB NOT NULL DEFAULT '{}',
    signoff_score NUMERIC,
    reviewer_comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT requirement_brd_status_check CHECK (status IN ('draft', 'ready', 'signed_off', 'rejected', 'error'))
);

-- Add comment to the table
COMMENT ON TABLE public.requirement_brd IS 'Stores signoff data for requirements';

-- Create index on requirement_id for better query performance
CREATE INDEX IF NOT EXISTS requirement_brd_requirement_id_idx ON public.requirement_brd(requirement_id);

-- Enable Row Level Security
ALTER TABLE public.requirement_brd ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mcp
CREATE POLICY "mcp_view_policy" 
ON public.requirement_brd
FOR SELECT 
USING (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role'
);

CREATE POLICY "mcp_insert_policy" 
ON public.requirement_brd
FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role'
);

CREATE POLICY "mcp_update_policy" 
ON public.requirement_brd
FOR UPDATE 
USING (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role'
)
WITH CHECK (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role'
);

CREATE POLICY "mcp_delete_policy" 
ON public.requirement_brd
FOR DELETE 
USING (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role'
);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_requirement_brd_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_requirement_brd_timestamp
BEFORE UPDATE ON public.requirement_brd
FOR EACH ROW EXECUTE PROCEDURE update_requirement_brd_updated_at(); 