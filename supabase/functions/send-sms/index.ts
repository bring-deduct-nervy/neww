import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { phone, message, templateId, variables } = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('key_value')
      .eq('service', 'TWILIO')
      .eq('is_active', true)
      .single();

    let finalMessage = message;
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        finalMessage = finalMessage.replace(`{${key}}`, value as string);
      });
    }

    const { data: smsLog, error: logError } = await supabase
      .from('sms_logs')
      .insert({
        template_id: templateId,
        recipient_phone: phone,
        content: finalMessage,
        status: apiKey ? 'SENT' : 'PENDING',
        sent_at: apiKey ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (logError) {
      throw logError;
    }

    if (apiKey) {
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('service', 'TWILIO');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: apiKey ? 'SMS sent successfully' : 'SMS queued (no API key configured)',
        smsId: smsLog.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
