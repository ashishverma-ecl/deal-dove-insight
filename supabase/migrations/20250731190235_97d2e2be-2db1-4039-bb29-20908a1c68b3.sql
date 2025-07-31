-- Add output column to test_results table
ALTER TABLE public.test_results 
ADD COLUMN output text;