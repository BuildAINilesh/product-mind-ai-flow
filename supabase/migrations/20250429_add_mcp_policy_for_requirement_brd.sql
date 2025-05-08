-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own requirement BRDs" ON public.requirement_brd;
DROP POLICY IF EXISTS "Users can insert own requirement BRDs" ON public.requirement_brd;
DROP POLICY IF EXISTS "Users can update own requirement BRDs" ON public.requirement_brd;
DROP POLICY IF EXISTS "Users can delete own requirement BRDs" ON public.requirement_brd;

-- Add mcp policy for viewing
CREATE POLICY "mcp_view_policy" 
ON public.requirement_brd
FOR SELECT 
USING (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role' OR
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = auth.users.id AND auth.users.email LIKE '%@mcp.example.com'
    )
);

-- Add mcp policy for inserting
CREATE POLICY "mcp_insert_policy" 
ON public.requirement_brd
FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role' OR
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = auth.users.id AND auth.users.email LIKE '%@mcp.example.com'
    )
);

-- Add mcp policy for updating
CREATE POLICY "mcp_update_policy" 
ON public.requirement_brd
FOR UPDATE 
USING (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role' OR
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = auth.users.id AND auth.users.email LIKE '%@mcp.example.com'
    )
)
WITH CHECK (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role' OR
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = auth.users.id AND auth.users.email LIKE '%@mcp.example.com'
    )
);

-- Add mcp policy for deleting
CREATE POLICY "mcp_delete_policy" 
ON public.requirement_brd
FOR DELETE 
USING (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role' OR
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = auth.users.id AND auth.users.email LIKE '%@mcp.example.com'
    )
); 