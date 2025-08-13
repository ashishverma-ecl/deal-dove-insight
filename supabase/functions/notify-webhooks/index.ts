import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    // Truncate test_results table to start fresh for this new session
    try {
      const { error: truncateError } = await supabase.rpc('clear_test_results');
      if (truncateError) {
        console.error('Error truncating test_results:', truncateError);
      } else {
        console.log('Successfully truncated test_results table for new session');
      }
    } catch (error) {
      console.error('Failed to truncate test_results:', error);
    }

    const webhookUrls = [
      "https://climatewarrior87.app.n8n.cloud/webhook/017a6a51-ed45-4a77-9d2f-92415c2daa2e", // Production
       "https://climatewarrior87.app.n8n.cloud/webhook/e365b20c-feec-43f1-ab9b-ad3b71d9c530" // Test environment (commented out)
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