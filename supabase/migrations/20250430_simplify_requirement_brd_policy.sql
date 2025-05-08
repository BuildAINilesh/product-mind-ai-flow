-- Drop all existing policies on the table first
DROP POLICY IF EXISTS "mcp_view_policy" ON public.requirement_brd;
DROP POLICY IF EXISTS "mcp_insert_policy" ON public.requirement_brd;
DROP POLICY IF EXISTS "mcp_update_policy" ON public.requirement_brd;
DROP POLICY IF EXISTS "mcp_delete_policy" ON public.requirement_brd;

-- Create a simple policy that allows all authenticated users to do everything
CREATE POLICY "Enable insert for authenticated users only"
ON public.requirement_brd
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users only"
ON public.requirement_brd
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for authenticated users only"
ON public.requirement_brd
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
ON public.requirement_brd
FOR DELETE
TO authenticated
USING (true); 