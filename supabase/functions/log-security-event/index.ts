import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LOG-SECURITY-EVENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Use service role key for logging
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get client IP from headers
    const clientIP = req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    logStep("Client IP detected", { ip: clientIP });

    // Parse request body
    const body = await req.json();
    const {
      event_type,
      target_user_id,
      details,
      user_agent
    } = body;

    if (!event_type) {
      throw new Error("event_type is required");
    }

    logStep("Logging security event", { event_type, target_user_id });

    // Try to get authenticated user (may be null for some events)
    let currentUserId = null;
    try {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData } = await supabaseClient.auth.getUser(token);
        currentUserId = userData.user?.id || null;
      }
    } catch (error) {
      logStep("No authenticated user", { error: error.message });
    }

    // Insert security event
    const { error: insertError } = await supabaseClient
      .from('security_audit_log')
      .insert({
        event_type,
        user_id: currentUserId,
        target_user_id,
        details,
        ip_address: clientIP,
        user_agent,
      });

    if (insertError) {
      throw new Error(`Failed to insert security event: ${insertError.message}`);
    }

    logStep("Security event logged successfully");

    // Check for critical events that need immediate attention
    const criticalEvents = [
      'PRIVILEGE_ESCALATION',
      'SUSPICIOUS_ACTIVITY',
      'MULTIPLE_FAILED_AUTH',
      'DATA_BREACH_ATTEMPT'
    ];

    if (criticalEvents.includes(event_type)) {
      logStep("CRITICAL SECURITY EVENT DETECTED", { event_type, details });
      
      // In a production environment, you might want to:
      // - Send alerts to security team
      // - Trigger automated security responses
      // - Log to external security systems
    }

    return new Response(
      JSON.stringify({ success: true, logged_at: new Date().toISOString() }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in log-security-event", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});