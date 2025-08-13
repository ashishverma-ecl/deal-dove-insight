-- Add screening_criterion column to user_remarks table to make remarks specific to each screening criteria
ALTER TABLE public.user_remarks 
ADD COLUMN screening_criterion TEXT;

-- Create an index for better performance when filtering by screening_criterion
CREATE INDEX idx_user_remarks_screening_criterion 
ON public.user_remarks(screening_criterion);

-- Create a composite index for session_id and screening_criterion
CREATE INDEX idx_user_remarks_session_criterion 
ON public.user_remarks(session_id, screening_criterion);