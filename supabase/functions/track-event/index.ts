
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface TrackingEvent {
  session_id: string;
  event_type: 'click' | 'pageview';
  url: string;
  element_tag?: string;
  element_id?: string;
  element_classes?: string;
  click_x?: number;
  click_y?: number;
  screen_resolution?: string;
  client_timestamp: string;
  website_id?: string;
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function sanitizeString(input: string | undefined, maxLength: number = 255): string | null {
  if (!input) return null;
  return input.trim().substring(0, maxLength);
}

function validateEventType(eventType: string): eventType is 'click' | 'pageview' {
  return ['click', 'pageview'].includes(eventType);
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 requests per minute per IP
  
  const current = rateLimitStore.get(ip);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

function getClientIP(req: Request): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  const xRealIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  return cfConnectingIP || xRealIP || xForwardedFor?.split(',')[0] || 'unknown';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(req);
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate required fields
    if (!body.session_id || typeof body.session_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid session_id' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!validateEventType(body.event_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid event_type. Must be "click" or "pageview"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!body.url || !isValidUrl(body.url)) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid URL' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!body.client_timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing client_timestamp' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Sanitize and prepare data
    const eventData = {
      session_id: sanitizeString(body.session_id, 36),
      event_type: body.event_type,
      url: sanitizeString(body.url, 2048),
      element_tag: sanitizeString(body.element_tag, 50),
      element_id: sanitizeString(body.element_id, 255),
      element_classes: sanitizeString(body.element_classes, 1000),
      click_x: typeof body.click_x === 'number' ? Math.max(0, Math.min(body.click_x, 10000)) : null,
      click_y: typeof body.click_y === 'number' ? Math.max(0, Math.min(body.click_y, 10000)) : null,
      screen_resolution: sanitizeString(body.screen_resolution, 11),
      user_agent: sanitizeString(req.headers.get('user-agent') || '', 500),
      ip_address: clientIP !== 'unknown' ? clientIP : null,
      client_timestamp: body.client_timestamp,
      website_id: body.website_id || null
    };

    // Initialize Supabase client with explicit configuration
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    console.log('Creating Supabase client with URL:', supabaseUrl);
    console.log('Using anon key (first 20 chars):', supabaseAnonKey?.substring(0, 20));
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log('Attempting to insert event data:', JSON.stringify(eventData, null, 2));

    // Insert event into database
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return new Response(
        JSON.stringify({ error: 'Failed to save event', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Event tracked successfully: ${data.id} from IP: ${clientIP}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        event_id: data.id,
        message: 'Event tracked successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
