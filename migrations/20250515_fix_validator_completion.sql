-- Update the complete_validator function to remove the current_stage check
-- This ensures the function will work regardless of what stage the flow is in

CREATE OR REPLACE FUNCTION complete_validator(req_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.requirement_flow_tracking
    SET 
        validator_status = 'validation_complete',
        current_stage = 'case_generator',
        case_generator_status = 'case_draft'
    WHERE 
        requirement_id = req_id;
        -- Removed the "AND current_stage = 'validator'" condition
END;
$$ LANGUAGE plpgsql; 