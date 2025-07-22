-- Add url column to assessment_documents table to store file URL
ALTER TABLE public.assessment_documents 
ADD COLUMN url TEXT;