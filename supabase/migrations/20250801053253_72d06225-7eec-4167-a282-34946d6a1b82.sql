-- Create user_remarks table for comments and document uploads
CREATE TABLE public.user_remarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_comment TEXT NOT NULL,
  uploaded_document_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_remarks ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view all remarks" 
ON public.user_remarks 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create remarks" 
ON public.user_remarks 
FOR INSERT 
WITH CHECK (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_remarks_updated_at
BEFORE UPDATE ON public.user_remarks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();