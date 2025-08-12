
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'system';
  timestamp: Date;
}

const ChatBotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate or retrieve chat ID and session ID
  useEffect(() => {
    const generateId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Try to get existing chat ID from localStorage
    let existingChatId = localStorage.getItem('chatbot_chat_id');
    
    if (!existingChatId) {
      existingChatId = generateId();
      localStorage.setItem('chatbot_chat_id', existingChatId);
    }
    
    setChatId(existingChatId);

    // Generate session ID (new for each browser session)
    let existingSessionId = sessionStorage.getItem('chatbot_session_id');
    
    if (!existingSessionId) {
      existingSessionId = generateId();
      sessionStorage.setItem('chatbot_session_id', existingSessionId);
    }
    
    setSessionId(existingSessionId);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to save conversation to Supabase
  const saveConversationToSupabase = async (message: string) => {
    try {
      const { error } = await supabase.rpc('upsert_chatbot_conversation', {
        p_session_id: sessionId,
        p_chat_id: chatId,
        p_new_message: message
      });

      if (error) {
        console.error('Error saving conversation to Supabase:', error);
      }
    } catch (error) {
      console.error('Error calling Supabase function:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Save user message to Supabase
    await saveConversationToSupabase(`USER: ${userMessage.content}`);

    try {
      console.log('Sending message to webhook:', userMessage.content);
      console.log('Chat ID:', chatId);
      console.log('Session ID:', sessionId);
      const response = await fetch('https://climatewarrior87.app.n8n.cloud/webhook/1b0b5db2-7e7e-4238-a76a-881ca7b435da', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_from_user: userMessage.content,
          chat_id: chatId,
          session_id: sessionId
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the response text
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // Try to parse as JSON, fallback to plain text
      let botResponseContent = responseText;
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('Parsed JSON response:', jsonResponse);
        // Handle different response formats
        if (jsonResponse.message) {
          botResponseContent = jsonResponse.message;
        } else if (typeof jsonResponse === 'string') {
          botResponseContent = jsonResponse;
        } else {
          botResponseContent = responseText;
        }
      } catch {
        // Use responseText as is if not valid JSON
        console.log('Response is not JSON, using as plain text');
        botResponseContent = responseText;
      }

      console.log('Final bot response content:', botResponseContent);

      // Add bot response to chat
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponseContent,
        role: 'system',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Save bot response to Supabase
      await saveConversationToSupabase(`BOT: ${botResponseContent}`);

    } catch (error) {
      console.error('Error sending message to webhook:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error sending your message. Please try again.",
        role: 'system',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Error",
        description: "Failed to send message to webhook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96">
      <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-purple-600 rounded-t-lg">
          <CardTitle className="text-lg font-semibold text-white">ESDD Assistant</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0 text-white hover:bg-purple-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-64 w-full pr-4">
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Start a conversation!</p>
                  <p className="text-xs mt-1">Chat ID: {chatId}</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Waiting for response...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatBotWidget;
