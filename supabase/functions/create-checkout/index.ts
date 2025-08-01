import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Environment detection for Stripe keys
    const isProduction = Deno.env.get("SUPABASE_URL")?.includes("supabase.co");
    const stripeKey = isProduction 
      ? Deno.env.get("STRIPE_SECRET_KEY")
      : Deno.env.get("STRIPE_SECRET_KEY_TEST");

    if (!stripeKey) {
      const keyType = isProduction ? "production" : "test";
      throw new Error(`Stripe ${keyType} secret key is not set`);
    }
    logStep("Stripe key verified", { environment: isProduction ? "production" : "test" });

    // Create Supabase client using the service role key for secure operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseService.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { priceId, isUpgrade = false, upgradeData } = await req.json();
    if (!priceId) throw new Error("Price ID is required");
    logStep("Request parsed", { priceId, isUpgrade, upgradeData });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found");
    }

    // Get pricing details from database
    const { data: pricingData, error: pricingError } = await supabaseService
      .from('pricing')
      .select('*')
      .eq('id', priceId)
      .eq('active', true)
      .single();

    if (pricingError || !pricingData) {
      throw new Error("Invalid or inactive pricing plan");
    }
    logStep("Pricing data retrieved", { title: pricingData.title, price: pricingData.price });

    // Create checkout session
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    // Build success URL with upgrade parameters if needed
    let successUrl = `${origin}/payment-success`;
    if (isUpgrade) {
      successUrl += `?upgrade=true&pricing_id=${encodeURIComponent(priceId)}`;
      logStep("Building upgrade success URL", { successUrl });
    } else {
      logStep("Building normal success URL", { successUrl });
    }
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { 
              name: pricingData.title,
              description: pricingData.description_en || pricingData.description_fr
            },
            unit_amount: Math.round(pricingData.price * 100), // Convert to cents
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: `${origin}/add-website?canceled=true`,
      metadata: {
        user_id: user.id,
        pricing_id: priceId,
        is_upgrade: isUpgrade.toString(),
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Log checkout creation for audit
    await supabaseService
      .from('events')
      .insert({
        event_type: 'checkout_created',
        session_id: session.id,
        url: `${origin}/pricing`,
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        client_timestamp: new Date().toISOString(),
        website_id: null,
      });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});