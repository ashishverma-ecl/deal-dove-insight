import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, assessmentId, assessmentData, conversationHistory } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    // Prepare the system prompt with assessment context
    const systemPrompt = `You are an expert ESDD (Environmental, Social and Due Diligence) assistant helping users understand screening criteria and performance scores.

Current Assessment Context:
- Assessment ID: ${assessmentId || 'N/A'}
- Assessment Data: ${assessmentData ? JSON.stringify(assessmentData, null, 2) : 'Not provided'}

Your role is to:
1. Help users understand ESDD screening criteria and their thresholds
2. Explain performance scores and assessment outcomes
3. Clarify why certain criteria resulted in "Pass" or "Manual ESDD Required" outcomes
4. Provide insights into risk categories (Environmental, Social, Governance)
5. Explain the significance of different risk scores and percentage thresholds

Key ESDD Categories to know about:
- Environmental: Coal, oil & gas, nuclear, environmental violations, deforestation, biodiversity, pollution, climate change, hazardous waste
- Social: Weapons, tobacco, alcohol, gambling, human rights, labor rights, child labor, workplace safety, conflict minerals
- Governance: UN Global Compact, OECD guidelines, corruption, tax issues, money laundering, cybersecurity, data privacy, board governance, sanctions, regulatory compliance

Guidelines:
- Be concise but thorough in explanations
- Use specific data when available from the assessment
- Explain thresholds and why they matter
- Suggest next steps when Manual ESDD is required
- Be professional and helpful
- If asked about specific criteria not in the data, provide general guidance about that type of screening`;

    // Prepare conversation messages
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (last few messages for context)
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: any) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          });
        }
      });
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: messages.slice(1), // Remove system message for Anthropic API
        system: systemPrompt // System prompt goes here for Anthropic
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.content[0].text;

    return new Response(JSON.stringify({ response: assistantResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in esdd-chatbot function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});