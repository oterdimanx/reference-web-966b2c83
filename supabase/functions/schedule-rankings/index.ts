
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

  const startTime = new Date();
  let logId: string | null = null;

  try {
    // Parse request body to get source information
    let requestBody = {};
    let requestSource = 'manual';
    
    try {
      const body = await req.text();
      if (body) {
        requestBody = JSON.parse(body);
        requestSource = requestBody.triggered_by || 'manual';
      }
    } catch (e) {
      // Ignore JSON parsing errors for empty bodies
    }

    console.log(`Starting ranking request processing... (source: ${requestSource})`);
    
    // Log execution start
    const { data: logEntry, error: logError } = await supabase
      .from('cron_execution_logs')
      .insert({
        job_name: 'schedule-rankings',
        status: 'started',
        request_source: requestSource,
        execution_time: startTime.toISOString()
      })
      .select('id')
      .single();

    if (logError) {
      console.error('Failed to log execution start:', logError);
    } else {
      logId = logEntry?.id;
      console.log(`Execution logged with ID: ${logId}`);
    }

    // Get pending ranking requests ordered by priority and requested_at
    const { data: pendingRequests, error: requestsError } = await supabase
      .from('ranking_requests')
      .select(`
        id,
        user_id,
        website_id,
        keyword,
        priority,
        requested_at,
        websites!inner(domain, keywords)
      `)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('requested_at', { ascending: true })
      .limit(50); // Process max 50 requests per run to avoid timeout

    if (requestsError) {
      console.error('Error fetching pending requests:', requestsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pending requests' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pendingRequests?.length || 0} pending ranking requests`);

    if (!pendingRequests || pendingRequests.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          processed: 0,
          message: 'No pending requests to process'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    // Process each ranking request
    for (const request of pendingRequests) {
      try {
        console.log(`Processing request: ${request.keyword} for ${request.websites.domain}`);
        
        // Update status to processing
        await supabase
          .from('ranking_requests')
          .update({ 
            status: 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', request.id);
        
        // Call the fetch-rankings function for this specific keyword
        const response = await supabase.functions.invoke('fetch-rankings', {
          body: { 
            websiteId: request.website_id,
            specificKeyword: request.keyword
          }
        });

        if (response.error) {
          console.error(`Error processing request ${request.id}:`, response.error);
          
          // Update status to failed
          await supabase
            .from('ranking_requests')
            .update({ 
              status: 'failed',
              error_message: response.error.message,
              processed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', request.id);
          
          results.push({
            requestId: request.id,
            keyword: request.keyword,
            domain: request.websites.domain,
            success: false,
            error: response.error.message
          });
        } else {
          console.log(`Successfully processed request ${request.id}`);
          
          // Update status to completed
          await supabase
            .from('ranking_requests')
            .update({ 
              status: 'completed',
              processed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', request.id);
          
          results.push({
            requestId: request.id,
            keyword: request.keyword,
            domain: request.websites.domain,
            success: true,
            data: response.data
          });
        }
        
        // Add delay between requests to respect API limits
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error(`Unexpected error processing request ${request.id}:`, error);
        
        // Update status to failed
        await supabase
          .from('ranking_requests')
          .update({ 
            status: 'failed',
            error_message: error.message,
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', request.id);
        
        results.push({
          requestId: request.id,
          keyword: request.keyword,
          domain: request.websites?.domain || 'unknown',
          success: false,
          error: error.message
        });
      }
    }

    console.log('Ranking request processing completed');

    // Update execution log with success
    if (logId) {
      const endTime = new Date();
      const executionDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // seconds
      
      await supabase
        .from('cron_execution_logs')
        .update({
          status: 'completed',
          processed_requests: pendingRequests.length,
          execution_duration: `${executionDuration} seconds`,
          response_data: { 
            processed: pendingRequests.length, 
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
          }
        })
        .eq('id', logId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingRequests.length,
        results: results,
        execution_id: logId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in schedule-rankings function:', error);
    
    // Update execution log with failure
    if (logId) {
      const endTime = new Date();
      const executionDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // seconds
      
      await supabase
        .from('cron_execution_logs')
        .update({
          status: 'failed',
          error_message: error.message,
          execution_duration: `${executionDuration} seconds`
        })
        .eq('id', logId);
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        execution_id: logId 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
