-- Fix critical security vulnerability: Restrict ai_output table access to user's own sessions
-- Drop the overly permissive policy that allows anyone to view AI output
DROP POLICY IF EXISTS "Anyone can view AI output" ON ai_output;

-- Create a secure policy that only allows users to view AI output for their own sessions
CREATE POLICY "Users can view AI output for their own sessions" 
ON ai_output 
FOR SELECT 
USING (
  session_id IN (
    SELECT DISTINCT ad.session_id
    FROM assessment_documents ad
    JOIN assessments a ON ad.assessment_id = a.id
    WHERE a.user_id = auth.uid()
  )
);