-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.upsert_chatbot_conversation(
  p_session_id TEXT,
  p_chat_id TEXT,
  p_new_message TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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