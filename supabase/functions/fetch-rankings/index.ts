
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

interface EnhancedSearchResult extends SearchResult {
  searchDepth: number;
  confidence: string;
}

async function getSystemSettings(): Promise<{ maxResults: number; cooldownHours: number; batchSize: number }> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['deep_search_max_results', 'deep_search_cooldown_hours', 'deep_search_batch_size']);

    if (error) {
      console.error('Error fetching system settings:', error);
      return { maxResults: 300, cooldownHours: 168, batchSize: 100 };
    }

    const settings = data.reduce((acc, item) => {
      acc[item.setting_key] = parseInt(item.setting_value);
      return acc;
    }, {} as Record<string, number>);

    return {
      maxResults: settings.deep_search_max_results || 300,
      cooldownHours: settings.deep_search_cooldown_hours || 168,
      batchSize: settings.deep_search_batch_size || 100
    };
  } catch (error) {
    console.error('Error in getSystemSettings:', error);
    return { maxResults: 300, cooldownHours: 168, batchSize: 100 };
  }
}

async function checkIfPriorityKeyword(websiteId: string, keyword: string): Promise<{ isPriority: boolean; needsDeepSearch: boolean }> {
  try {
    const { data, error } = await supabase
      .from('user_keyword_preferences')
      .select('is_priority, deep_search_enabled, last_deep_search_at')
      .eq('website_id', websiteId)
      .eq('keyword', keyword)
      .single();

    if (error || !data) {
      return { isPriority: false, needsDeepSearch: false };
    }

    const { cooldownHours } = await getSystemSettings();
    const now = new Date();
    const lastDeepSearch = data.last_deep_search_at ? new Date(data.last_deep_search_at) : null;
    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    
    const needsDeepSearch = data.deep_search_enabled && 
      (!lastDeepSearch || (now.getTime() - lastDeepSearch.getTime()) > cooldownMs);

    return {
      isPriority: data.is_priority || false,
      needsDeepSearch
    };
  } catch (error) {
    console.error('Error checking priority keyword:', error);
    return { isPriority: false, needsDeepSearch: false };
  }
}

async function fetchRankingFromSerpApi(keyword: string, domain: string, searchEngine: string = 'google', websiteId: string): Promise<EnhancedSearchResult | null> {
  if (!serpApiKey) {
    console.error('SERPAPI_KEY not found in environment variables');
    return null;
  }

  const { isPriority, needsDeepSearch } = await checkIfPriorityKeyword(websiteId, keyword);
  const { maxResults, batchSize } = await getSystemSettings();
  
  // Determine search strategy
  const searchDepth = (isPriority && needsDeepSearch) ? maxResults : 100;
  
  console.log(`Searching for "${keyword}" with depth ${searchDepth} (priority: ${isPriority}, needsDeep: ${needsDeepSearch})`);

  try {
    let allResults: SearchResult[] = [];
    let foundResult: SearchResult | null = null;
    let actualSearchDepth = 0;

    // Progressive search in batches
    for (let start = 0; start < searchDepth; start += batchSize) {
      const params = new URLSearchParams({
        q: keyword,
        engine: searchEngine,
        api_key: serpApiKey,
        num: Math.min(batchSize, searchDepth - start).toString(),
        start: start.toString(),
        gl: 'fr', // France for localized results
        hl: 'fr', // French language
      });

      const response = await fetch(`https://serpapi.com/search?${params}`);
      const data: SerpApiResponse = await response.json();

      if (!data.organic_results || data.organic_results.length === 0) {
        console.log(`No more results found at position ${start + 1}+`);
        break;
      }

      actualSearchDepth = start + data.organic_results.length;
      allResults.push(...data.organic_results);

      // Check if domain is found in this batch
      const batchResult = data.organic_results.find((result, index) => {
        try {
          // Normalize both domains consistently with sanitizeDomain() logic
          const resultDomain = new URL(result.link).hostname
            .toLowerCase()
            .replace(/^www\./, '')
            .trim();
          let normalizedTargetDomain = domain
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/$/, '')
            .trim();
          
          const isMatch = resultDomain === normalizedTargetDomain || resultDomain.includes(normalizedTargetDomain);
          
          // Debug logging for domain comparison
          console.log(`Domain comparison: "${resultDomain}" vs "${normalizedTargetDomain}" => ${isMatch ? 'MATCH' : 'no match'}`);
          
          if (isMatch) {
            const globalPosition = start + index + 1;
            console.log(`Found domain match at position ${globalPosition}: ${resultDomain} matches ${normalizedTargetDomain}`);
            result.position = globalPosition; // Update position to global position
          }
          
          return isMatch;
        } catch (error) {
          console.error('Error parsing URL:', result.link, error);
          return false;
        }
      });

      if (batchResult) {
        foundResult = batchResult;
        break;
      }

      // Add delay between requests to respect rate limits
      if (start + batchSize < searchDepth) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update deep search timestamp if this was a deep search
    if (needsDeepSearch && searchDepth > 100) {
      await supabase
        .from('user_keyword_preferences')
        .update({ last_deep_search_at: new Date().toISOString() })
        .eq('website_id', websiteId)
        .eq('keyword', keyword);
    }

    const confidence = foundResult 
      ? (foundResult.position <= 100 ? 'high' : foundResult.position <= 200 ? 'medium' : 'low')
      : 'none';

    console.log(`Search completed for "${keyword}": found at position ${foundResult?.position || 'not found'}, searched ${actualSearchDepth} results`);

    return foundResult ? {
      ...foundResult,
      searchDepth: actualSearchDepth,
      confidence
    } : null;

  } catch (error) {
    console.error('Error fetching from SerpApi:', error);
    return null;
  }
}

async function saveRankingSnapshot(websiteId: string, keyword: string, searchEngine: string, result: EnhancedSearchResult | null) {
  try {
    const snapshotData = {
      website_id: websiteId,
      keyword: keyword,
      search_engine: searchEngine,
      position: result?.position || null,
      url: result?.link || null,
      title: result?.title || null,
      description: result?.snippet || null,
      search_depth: result?.searchDepth || 100,
      ranking_confidence: result?.confidence || 'none',
      is_priority_keyword: false, // Will be updated based on user preferences
      snapshot_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };

    // Check if this is a priority keyword
    const { data: keywordPref } = await supabase
      .from('user_keyword_preferences')
      .select('is_priority')
      .eq('website_id', websiteId)
      .eq('keyword', keyword)
      .single();

    if (keywordPref?.is_priority) {
      snapshotData.is_priority_keyword = true;
    }

    const { error } = await supabase
      .from('ranking_snapshots')
      .insert(snapshotData);

    if (error) {
      console.error('Error saving ranking snapshot:', error);
      return false;
    }

    const confidenceText = result?.confidence === 'high' ? 'high confidence' : 
                          result?.confidence === 'medium' ? 'medium confidence' : 
                          result?.confidence === 'low' ? 'low confidence' : 'not found';
    
    console.log(`Saved ranking snapshot for ${keyword} on ${searchEngine}: position ${result?.position || 'not found'} (${confidenceText}, searched ${result?.searchDepth || 100} results)`);
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
        
        const result = await fetchRankingFromSerpApi(keyword, domain, searchEngine, websiteId);
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
