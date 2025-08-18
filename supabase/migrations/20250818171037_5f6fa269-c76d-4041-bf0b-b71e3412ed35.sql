-- Add status column to ai_output table
ALTER TABLE public.ai_output 
ADD COLUMN status text DEFAULT 'pending';

-- Add comments column to ai_output table  
ALTER TABLE public.ai_output 
ADD COLUMN comments text;