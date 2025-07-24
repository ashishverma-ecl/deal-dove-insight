-- Add session_id column to assessment_documents table
ALTER TABLE public.assessment_documents 
ADD COLUMN session_id TEXT;