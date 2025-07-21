-- Create storage bucket for assessment documents
INSERT INTO storage.buckets (id, name, public) VALUES ('assessment-documents', 'assessment-documents', false);

-- Create policies for assessment documents
CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'assessment-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'assessment-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'assessment-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create table to track assessments
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on assessments table
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for assessments
CREATE POLICY "Users can view their own assessments" 
ON public.assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" 
ON public.assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" 
ON public.assessments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create table to track uploaded documents
CREATE TABLE public.assessment_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on assessment_documents table
ALTER TABLE public.assessment_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for assessment documents
CREATE POLICY "Users can view documents of their assessments" 
ON public.assessment_documents 
FOR SELECT 
USING (assessment_id IN (SELECT id FROM public.assessments WHERE user_id = auth.uid()));

CREATE POLICY "Users can add documents to their assessments" 
ON public.assessment_documents 
FOR INSERT 
WITH CHECK (assessment_id IN (SELECT id FROM public.assessments WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete documents from their assessments" 
ON public.assessment_documents 
FOR DELETE 
USING (assessment_id IN (SELECT id FROM public.assessments WHERE user_id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();