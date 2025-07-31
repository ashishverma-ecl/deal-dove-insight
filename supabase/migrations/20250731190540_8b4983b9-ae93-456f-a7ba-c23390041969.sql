-- Remove output column from test_results table
ALTER TABLE public.test_results 
DROP COLUMN output;