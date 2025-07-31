-- Create function to clear test_results table
CREATE OR REPLACE FUNCTION public.clear_test_results()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.test_results;
END;
$$;