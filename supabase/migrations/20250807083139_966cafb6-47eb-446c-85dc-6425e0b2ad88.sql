-- Add Within_threshold and session_id columns to AI_output table
ALTER TABLE public.ai_output 
ADD COLUMN within_threshold text,
ADD COLUMN session_id text;