-- Create session_messages table for chat support
CREATE TABLE IF NOT EXISTS public.session_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'productmind')),
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'support',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment to the table
COMMENT ON TABLE public.session_messages IS 'Stores chat messages between users and ProductMind';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS session_messages_session_id_idx ON public.session_messages(session_id);
CREATE INDEX IF NOT EXISTS session_messages_user_id_idx ON public.session_messages(user_id);
CREATE INDEX IF NOT EXISTS session_messages_timestamp_idx ON public.session_messages(timestamp);

-- Enable Row Level Security
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own messages"
ON public.session_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
ON public.session_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create feedback table for storing feature requests and bug reports
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('feature_request', 'bug_report', 'general')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'resolved', 'declined')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment to the table
COMMENT ON TABLE public.feedback IS 'Stores user feedback from support chat';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON public.feedback(status);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own feedback"
ON public.feedback
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
ON public.feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admin users to view and manage all feedback
CREATE POLICY "Admins can view all feedback"
ON public.feedback
FOR ALL
USING (auth.role() = 'service_role'); 