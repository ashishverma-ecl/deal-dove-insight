-- Enable Row Level Security on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents table
CREATE POLICY "Public access to documents" 
ON public.documents 
FOR ALL 
USING (true)
WITH CHECK (true);