-- Fix the clear_test_results function to properly truncate the table
CREATE OR REPLACE FUNCTION public.clear_test_results()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  TRUNCATE TABLE public.test_results RESTART IDENTITY;
END;
$function$