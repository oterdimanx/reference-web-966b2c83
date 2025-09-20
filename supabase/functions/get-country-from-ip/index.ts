import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IPLocationResult {
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  status: string;
  message?: string;
}

interface CountryData {
  countryCode: string;
  countryName: string;
  coordinates: [number, number];
}

// Cache for IP to country mappings to avoid repeated API calls
const ipCache = new Map<string, CountryData>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ipAddresses } = await req.json();
    
    if (!ipAddresses || !Array.isArray(ipAddresses)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request. Expected array of IP addresses.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${ipAddresses.length} IP addresses`);
    
    const results: { [ip: string]: CountryData | null } = {};
    const uncachedIPs = ipAddresses.filter(ip => {
      // Check if IP is already cached
      if (ipCache.has(ip)) {
        results[ip] = ipCache.get(ip)!;
        return false;
      }
      
      // Skip private/invalid IP addresses
      if (!isValidPublicIP(ip)) {
        results[ip] = null;
        return false;
      }
      
      return true;
    });

    console.log(`Found ${ipAddresses.length - uncachedIPs.length} cached results, need to fetch ${uncachedIPs.length} new ones`);

    // Fetch country data for uncached IPs
    // Using ip-api.com free tier (45 requests/minute limit)
    for (const ip of uncachedIPs) {
      try {
        // Add small delay to respect rate limits
        if (uncachedIPs.indexOf(ip) > 0) {
          await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
        }

        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,lat,lon`, {
          timeout: 10000, // 10 second timeout
        });
        
        if (!response.ok) {
          console.log(`HTTP error for IP ${ip}: ${response.status}`);
          results[ip] = null;
          continue;
        }
        
        const text = await response.text();
        
        // Check if response is empty
        if (!text || text.trim() === '') {
          console.log(`Empty response for IP ${ip}`);
          results[ip] = null;
          continue;
        }
        
        let data: IPLocationResult;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.log(`JSON parse error for IP ${ip}: ${parseError.message}`);
          results[ip] = null;
          continue;
        }
        
        if (data.status === 'success') {
          const countryData: CountryData = {
            countryCode: data.countryCode,
            countryName: data.country,
            coordinates: [data.lon, data.lat]
          };
          
          // Cache the result
          ipCache.set(ip, countryData);
          results[ip] = countryData;
          
          console.log(`Successfully resolved ${ip} to ${data.country} (${data.countryCode})`);
        } else {
          console.log(`Failed to resolve ${ip}: ${data.message || data.status || 'Unknown error'}`);
          results[ip] = null;
        }
      } catch (error) {
        console.error(`Error processing IP ${ip}:`, error);
        results[ip] = null;
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-country-from-ip function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function isValidPublicIP(ip: string): boolean {
  // Basic IP format validation
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    return false;
  }

  const parts = ip.split('.').map(Number);
  
  // Check if all parts are valid (0-255)
  if (parts.some(part => part < 0 || part > 255)) {
    return false;
  }

  // Exclude private IP ranges
  // 10.0.0.0/8
  if (parts[0] === 10) return false;
  
  // 172.16.0.0/12
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
  
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return false;
  
  // 127.0.0.0/8 (localhost)
  if (parts[0] === 127) return false;
  
  // 169.254.0.0/16 (link-local)
  if (parts[0] === 169 && parts[1] === 254) return false;

  return true;
}