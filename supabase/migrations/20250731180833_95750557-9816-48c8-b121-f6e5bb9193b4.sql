-- Fix security issue: set search_path for the function
CREATE OR REPLACE FUNCTION public.clear_test_results()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.test_results;
END;
$$;