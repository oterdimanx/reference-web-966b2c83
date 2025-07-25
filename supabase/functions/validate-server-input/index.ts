import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VALIDATE-SERVER-INPUT] ${step}${detailsStr}`);
};

// Enhanced domain validation
const validateDomain = (domain: string): { valid: boolean; error?: string } => {
  if (!domain || typeof domain !== 'string') {
    return { valid: false, error: 'Domain is required and must be a string' };
  }

  const trimmedDomain = domain.trim().toLowerCase();
  
  if (trimmedDomain.length === 0) {
    return { valid: false, error: 'Domain cannot be empty' };
  }

  if (trimmedDomain.length > 253) {
    return { valid: false, error: 'Domain name too long (max 253 characters)' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /localhost/i,
    /127\.0\.0\.1/,
    /192\.168\./,
    /10\./,
    /172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /file:\/\//i,
    /javascript:/i,
    /data:/i,
    /ftp:\/\//i,
    /<script/i,
    /[<>'"]/,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedDomain)) {
      return { valid: false, error: 'Domain contains suspicious patterns' };
    }
  }

  // Basic domain format validation
  const domainPattern = /^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?)*$/;
  if (!domainPattern.test(trimmedDomain)) {
    return { valid: false, error: 'Invalid domain format' };
  }

  // Check for valid TLD
  const parts = trimmedDomain.split('.');
  if (parts.length < 2) {
    return { valid: false, error: 'Domain must have at least two parts (domain.tld)' };
  }

  const tld = parts[parts.length - 1];
  if (tld.length < 2 || tld.length > 63) {
    return { valid: false, error: 'Invalid top-level domain' };
  }

  return { valid: true };
};

// Enhanced email validation
const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required and must be a string' };
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  if (trimmedEmail.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'Email too long (max 254 characters)' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /[<>'"]/,
    /\0/,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedEmail)) {
      return { valid: false, error: 'Email contains suspicious patterns' };
    }
  }

  // Enhanced email pattern validation
  const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailPattern.test(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check for common temporary email domains
  const tempEmailDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.org',
    'throwaway.email',
  ];

  const domain = trimmedEmail.split('@')[1];
  if (tempEmailDomains.includes(domain)) {
    return { valid: false, error: 'Temporary email addresses not allowed' };
  }

  return { valid: true };
};

// Text sanitization
const sanitizeText = (text: string, maxLength: number = 1000): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .trim()
    .substring(0, maxLength)
    .replace(/[<>'"&]/g, '') // Remove potential XSS characters
    .replace(/\0/g, ''); // Remove null bytes
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    // Parse request body
    const body = await req.json();
    const { validationType, data } = body;

    if (!validationType) {
      throw new Error("validationType is required");
    }

    logStep("Validating input", { validationType });

    let result: { valid: boolean; error?: string; sanitized?: any } = { valid: false };

    switch (validationType) {
      case 'domain':
        result = validateDomain(data.domain);
        if (result.valid) {
          result.sanitized = { domain: data.domain.trim().toLowerCase() };
        }
        break;

      case 'email':
        result = validateEmail(data.email);
        if (result.valid) {
          result.sanitized = { email: data.email.trim().toLowerCase() };
        }
        break;

      case 'website':
        const domainResult = validateDomain(data.domain);
        if (!domainResult.valid) {
          result = domainResult;
          break;
        }

        let sanitizedWebsite: any = {
          domain: data.domain.trim().toLowerCase(),
          title: sanitizeText(data.title, 200),
          description: sanitizeText(data.description, 1000),
        };

        if (data.contact_email) {
          const emailResult = validateEmail(data.contact_email);
          if (!emailResult.valid) {
            result = emailResult;
            break;
          }
          sanitizedWebsite.contact_email = data.contact_email.trim().toLowerCase();
        }

        if (data.contact_name) {
          sanitizedWebsite.contact_name = sanitizeText(data.contact_name, 100);
        }

        result = { valid: true, sanitized: sanitizedWebsite };
        break;

      default:
        throw new Error(`Unknown validation type: ${validationType}`);
    }

    logStep("Validation complete", { valid: result.valid, error: result.error });

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in validate-server-input", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ valid: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});