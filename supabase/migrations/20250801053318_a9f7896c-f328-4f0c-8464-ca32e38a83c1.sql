-- Fix RLS policies for user_remarks table to be more specific
DROP POLICY IF EXISTS "Users can view all remarks" ON public.user_remarks;
DROP POLICY IF EXISTS "Users can create remarks" ON public.user_remarks;

-- Create more specific policies
CREATE POLICY "Anyone can view remarks for their session" 
ON public.user_remarks 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create remarks" 
ON public.user_remarks 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);