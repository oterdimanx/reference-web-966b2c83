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
  query?: string; // Added for batch API responses
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

    // Process IPs in batches using ip-api.com batch endpoint
    const BATCH_SIZE = 100; // ip-api.com supports up to 100 IPs per batch request
    const batches = [];
    
    for (let i = 0; i < uncachedIPs.length; i += BATCH_SIZE) {
      batches.push(uncachedIPs.slice(i, i + BATCH_SIZE));
    }

    console.log(`Processing ${batches.length} batches of IPs`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      try {
        // Add delay between batches to respect rate limits (15 requests/minute for batch endpoint)
        if (batchIndex > 0) {
          await new Promise(resolve => setTimeout(resolve, 4000)); // 4 second delay between batches
        }

        const batchResponse = await fetch('http://ip-api.com/batch?fields=status,message,country,countryCode,lat,lon,query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(batch)
        });

        if (!batchResponse.ok) {
          console.log(`Batch HTTP error for batch ${batchIndex}: ${batchResponse.status}`);
          // Mark all IPs in this batch as failed
          batch.forEach(ip => results[ip] = null);
          continue;
        }

        const batchText = await batchResponse.text();
        
        if (!batchText || batchText.trim() === '') {
          console.log(`Empty batch response for batch ${batchIndex}`);
          batch.forEach(ip => results[ip] = null);
          continue;
        }

        let batchData: IPLocationResult[];
        try {
          batchData = JSON.parse(batchText);
        } catch (parseError) {
          console.log(`Batch JSON parse error for batch ${batchIndex}: ${parseError.message}`);
          batch.forEach(ip => results[ip] = null);
          continue;
        }

        if (!Array.isArray(batchData)) {
          console.log(`Invalid batch response format for batch ${batchIndex}`);
          batch.forEach(ip => results[ip] = null);
          continue;
        }

        // Process batch results
        batchData.forEach((data, index) => {
          const ip = batch[index];
          if (!ip) return;

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
        });

        console.log(`Processed batch ${batchIndex + 1}/${batches.length} (${batch.length} IPs)`);
        
      } catch (error) {
        console.error(`Error processing batch ${batchIndex}:`, error);
        // Mark all IPs in this batch as failed
        batch.forEach(ip => results[ip] = null);
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