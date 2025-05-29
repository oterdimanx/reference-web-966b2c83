
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting scheduled ranking updates...');

    // Get all websites that have keywords
    const { data: websites, error: websitesError } = await supabase
      .from('websites')
      .select('id, domain, keywords')
      .not('keywords', 'is', null)
      .neq('keywords', '');

    if (websitesError) {
      console.error('Error fetching websites:', websitesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch websites' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${websites?.length || 0} websites with keywords to check`);

    const results = [];

    if (websites && websites.length > 0) {
      for (const website of websites) {
        console.log(`Processing website: ${website.domain}`);
        
        try {
          // Call the fetch-rankings function for each website
          const response = await supabase.functions.invoke('fetch-rankings', {
            body: { websiteId: website.id }
          });

          if (response.error) {
            console.error(`Error processing ${website.domain}:`, response.error);
            results.push({
              websiteId: website.id,
              domain: website.domain,
              success: false,
              error: response.error.message
            });
          } else {
            console.log(`Successfully processed ${website.domain}`);
            results.push({
              websiteId: website.id,
              domain: website.domain,
              success: true,
              data: response.data
            });
          }

          // Add delay between websites to respect API limits
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`Exception processing ${website.domain}:`, error);
          results.push({
            websiteId: website.id,
            domain: website.domain,
            success: false,
            error: error.message
          });
        }
      }
    }

    console.log('Scheduled ranking updates completed');

    return new Response(
      JSON.stringify({ 
        success: true, 
        websitesProcessed: websites?.length || 0,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in schedule-rankings function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
