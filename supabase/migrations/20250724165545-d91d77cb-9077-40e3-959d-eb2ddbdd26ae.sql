-- Create assessment_documents table with session_id
CREATE TABLE public.assessment_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  title TEXT,
  url TEXT,
  session_id TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assessment_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for assessment_documents
CREATE POLICY "Users can view documents for their assessments" 
ON public.assessment_documents 
FOR SELECT 
USING (
  assessment_id IN (
    SELECT id FROM public.assessments WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create documents for their assessments" 
ON public.assessment_documents 
FOR INSERT 
WITH CHECK (
  assessment_id IN (
    SELECT id FROM public.assessments WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents for their assessments" 
ON public.assessment_documents 
FOR UPDATE 
USING (
  assessment_id IN (
    SELECT id FROM public.assessments WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents for their assessments" 
ON public.assessment_documents 
FOR DELETE 
USING (
  assessment_id IN (
    SELECT id FROM public.assessments WHERE user_id = auth.uid()
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_assessment_documents_updated_at
BEFORE UPDATE ON public.assessment_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();