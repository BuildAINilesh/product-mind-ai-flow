-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    company TEXT,
    job_title TEXT,
    interest TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contacted BOOLEAN DEFAULT FALSE
);

-- Add comment to explain table purpose
COMMENT ON TABLE public.waitlist IS 'Stores information about users who signed up for the waitlist';

-- Add RLS policies
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Only allow insert for anonymous users
CREATE POLICY "Allow inserts for anonymous users" 
ON public.waitlist 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Only allow select/update/delete for authenticated users with admin role
CREATE POLICY "Allow all operations for authenticated users with admin role" 
ON public.waitlist 
FOR ALL 
TO authenticated 
USING (auth.jwt() ? 'admin'); 