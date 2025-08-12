import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Webhook, Send, CheckCircle, XCircle } from "lucide-react";

const WebhookTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [webhookData, setWebhookData] = useState({
    assessment_id: "test-assessment-123",
    title: "Test Assessment",
    user_email: "test@example.com",
    documents_count: 3,
    session_id: "test-session-456",
    timestamp: new Date().toISOString()
  });
  const { toast } = useToast();

  const handleTestWebhook = async () => {
    setIsLoading(true);
    setResponse(null);

    try {
      const response = await fetch('/functions/v1/notify-webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      const data = await response.json();
      setResponse(data);

      if (data.success) {
        toast({
          title: "Webhook sent successfully",
          description: "Check the response below for details",
        });
      } else {
        toast({
          title: "Webhook failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast({
        title: "Error",
        description: "Failed to send webhook test",
        variant: "destructive",
      });
      setResponse({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setWebhookData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Webhook className="h-8 w-8 text-primary" />
          Webhook Tester
        </h1>
        <p className="text-muted-foreground">
          Test the notification webhook functionality by sending sample data.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Webhook Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assessment_id">Assessment ID</Label>
                <Input
                  id="assessment_id"
                  value={webhookData.assessment_id}
                  onChange={(e) => handleInputChange('assessment_id', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={webhookData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="user_email">User Email</Label>
                <Input
                  id="user_email"
                  type="email"
                  value={webhookData.user_email}
                  onChange={(e) => handleInputChange('user_email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="documents_count">Documents Count</Label>
                <Input
                  id="documents_count"
                  type="number"
                  value={webhookData.documents_count}
                  onChange={(e) => handleInputChange('documents_count', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="session_id">Session ID</Label>
                <Input
                  id="session_id"
                  value={webhookData.session_id}
                  onChange={(e) => handleInputChange('session_id', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="timestamp">Timestamp</Label>
                <Input
                  id="timestamp"
                  value={webhookData.timestamp}
                  onChange={(e) => handleInputChange('timestamp', e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleTestWebhook} 
              disabled={isLoading}
              className="w-full mt-6"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Sending Webhook...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Test Webhook
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {response && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {response.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={JSON.stringify(response, null, 2)}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WebhookTest;