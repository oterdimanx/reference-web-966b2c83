
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const serpApiKey = Deno.env.get('SERPAPI_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
}

interface SerpApiResponse {
  organic_results: SearchResult[];
}

async function fetchRankingFromSerpApi(keyword: string, domain: string, searchEngine: string = 'google'): Promise<SearchResult | null> {
  if (!serpApiKey) {
    console.error('SERPAPI_KEY not found in environment variables');
    return null;
  }

  try {
    const params = new URLSearchParams({
      q: keyword,
      engine: searchEngine,
      api_key: serpApiKey,
      num: '100', // Get up to 100 results to find the domain
      gl: 'fr', // France for localized results
      hl: 'fr', // French language
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data: SerpApiResponse = await response.json();

    console.log(`SerpAPI response for "${keyword}":`, {
      total_results: data.organic_results?.length || 0,
      first_few_domains: data.organic_results?.slice(0, 5).map(r => {
        try {
          return new URL(r.link).hostname;
        } catch {
          return r.link;
        }
      }) || []
    });

    if (!data.organic_results) {
      console.log('No organic results found for keyword:', keyword);
      return null;
    }

    // Find the domain in the results
    const result = data.organic_results.find((result, index) => {
      try {
        const resultDomain = new URL(result.link).hostname.replace('www.', '');
        // Properly normalize the target domain by removing protocol and www
        let normalizedTargetDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
        
        const isMatch = resultDomain === normalizedTargetDomain || resultDomain.includes(normalizedTargetDomain);
        
        if (isMatch) {
          console.log(`Found domain match at position ${index + 1}: ${resultDomain} matches ${normalizedTargetDomain}`);
        }
        
        return isMatch;
      } catch (error) {
        console.error('Error parsing URL:', result.link, error);
        return false;
      }
    });

    if (!result) {
      console.log(`Domain "${domain}" not found in top ${data.organic_results.length} results for "${keyword}"`);
    }

    return result || null;
  } catch (error) {
    console.error('Error fetching from SerpApi:', error);
    return null;
  }
}

async function saveRankingSnapshot(websiteId: string, keyword: string, searchEngine: string, result: SearchResult | null) {
  try {
    const snapshotData = {
      website_id: websiteId,
      keyword: keyword,
      search_engine: searchEngine,
      position: result?.position || null,
      url: result?.link || null,
      title: result?.title || null,
      description: result?.snippet || null,
      snapshot_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };

    const { error } = await supabase
      .from('ranking_snapshots')
      .insert(snapshotData);

    if (error) {
      console.error('Error saving ranking snapshot:', error);
      return false;
    }

    console.log(`Saved ranking snapshot for ${keyword} on ${searchEngine}: position ${result?.position || 'not found'}`);
    return true;
  } catch (error) {
    console.error('Exception saving ranking snapshot:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteId, specificKeyword } = await req.json();

    console.log('Starting ranking fetch for website:', websiteId);

    // Get website data
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('domain, keywords')
      .eq('id', websiteId)
      .single();

    if (websiteError || !website) {
      console.error('Website not found:', websiteError);
      return new Response(
        JSON.stringify({ error: 'Website not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const domain = website.domain;
    let keywordsToCheck: string[] = [];

    if (specificKeyword) {
      keywordsToCheck = [specificKeyword];
    } else if (website.keywords) {
      keywordsToCheck = website.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    }

    if (keywordsToCheck.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No keywords found for website' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking rankings for ${keywordsToCheck.length} keywords for domain: ${domain}`);

    const searchEngines = ['google', 'bing'];
    const results = [];

    // Process each keyword for each search engine
    for (const keyword of keywordsToCheck) {
      for (const searchEngine of searchEngines) {
        console.log(`Fetching ranking for "${keyword}" on ${searchEngine}`);
        
        const result = await fetchRankingFromSerpApi(keyword, domain, searchEngine);
        const saved = await saveRankingSnapshot(websiteId, keyword, searchEngine, result);
        
        results.push({
          keyword,
          searchEngine,
          position: result?.position || null,
          saved
        });

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('Ranking fetch completed for website:', websiteId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        domain,
        keywordsChecked: keywordsToCheck.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-rankings function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
