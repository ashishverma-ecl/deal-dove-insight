import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookData {
  assessment_id: string;
  title: string;
  user_email: string;
  documents_count: number;
  session_id: string;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookData: WebhookData = await req.json();
    
    console.log('Received webhook data:', webhookData);

    const webhookUrls = [
      //"https://climatewarrior87.app.n8n.cloud/webhook/017a6a51-ed45-4a77-9d2f-92415c2daa2e", // Production
      "https://climatewarrior87.app.n8n.cloud/webhook-test/017a6a51-ed45-4a77-9d2f-92415c2daa2e" // Test
    ];

    // Send webhooks in parallel
    const webhookPromises = webhookUrls.map(async (url) => {
      try {
        console.log(`Sending webhook to: ${url}`);
        
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookData),
        });

        console.log(`Webhook ${url} response status:`, response.status);
        
        if (!response.ok) {
          console.error(`Webhook ${url} failed with status:`, response.status);
          return { url, success: false, status: response.status };
        }
        
        return { url, success: true, status: response.status };
      } catch (error) {
        console.error(`Webhook ${url} error:`, error);
        return { url, success: false, error: error.message };
      }
    });

    const results = await Promise.all(webhookPromises);
    
    console.log('Webhook results:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhooks processed',
        results 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error processing webhook request:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});