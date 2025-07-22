-- Add title column to assessment_documents table to store company name
ALTER TABLE public.assessment_documents 
ADD COLUMN title TEXT;