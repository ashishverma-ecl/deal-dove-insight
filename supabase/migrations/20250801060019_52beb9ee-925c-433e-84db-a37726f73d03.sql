-- Create chatbot_conversations table
CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  conversation TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chat_id, session_id)
);

-- Enable Row Level Security
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view conversations for their sessions"
ON public.chatbot_conversations
FOR SELECT
USING (
  session_id IN (
    SELECT DISTINCT session_id 
    FROM assessment_documents 
    WHERE assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create conversations for their sessions"
ON public.chatbot_conversations
FOR INSERT
WITH CHECK (
  session_id IN (
    SELECT DISTINCT session_id 
    FROM assessment_documents 
    WHERE assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update conversations for their sessions"
ON public.chatbot_conversations
FOR UPDATE
USING (
  session_id IN (
    SELECT DISTINCT session_id 
    FROM assessment_documents 
    WHERE assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  )
);

-- Create function to upsert conversation
CREATE OR REPLACE FUNCTION public.upsert_chatbot_conversation(
  p_session_id TEXT,
  p_chat_id TEXT,
  p_new_message TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.chatbot_conversations (session_id, chat_id, conversation)
  VALUES (p_session_id, p_chat_id, p_new_message)
  ON CONFLICT (chat_id, session_id)
  DO UPDATE SET 
    conversation = chatbot_conversations.conversation || E'\n' || p_new_message,
    updated_at = now();
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chatbot_conversations_updated_at
BEFORE UPDATE ON public.chatbot_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();