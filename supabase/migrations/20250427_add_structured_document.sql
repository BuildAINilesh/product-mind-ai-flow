
-- Add structured_document column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS structured_document JSONB;
