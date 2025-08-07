-- Create AI_output table
CREATE TABLE public.ai_output (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sr_no text,
  risk_category text,
  screening_criterion text,
  threshold text,
  performance text,
  context text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_output ENABLE ROW LEVEL SECURITY;

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_ai_output_updated_at
  BEFORE UPDATE ON public.ai_output
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create basic RLS policies (adjust as needed based on access requirements)
CREATE POLICY "Anyone can view AI output" 
  ON public.ai_output 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert AI output" 
  ON public.ai_output 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update AI output" 
  ON public.ai_output 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete AI output" 
  ON public.ai_output 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);