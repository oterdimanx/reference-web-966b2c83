
-- First, let's unschedule the existing broken cron job
SELECT cron.unschedule('daily-ranking-check');

-- Enable the required extensions for cron jobs (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a properly configured daily cron job to check rankings at 2 AM UTC
SELECT cron.schedule(
  'daily-ranking-check',
  '0 2 * * *', -- Run daily at 2 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://jixmwjplysaqlyzhpcmk.supabase.co/functions/v1/schedule-rankings',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeG13anBseXNhcWx5emhwY21rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQzNzYyNCwiZXhwIjoyMDYyMDEzNjI0fQ.lJQoytVN4eE9c1hB8RJhGy5F8aKE-9x5-z7JbJxbLmE"}'::jsonb,
        body:='{"source": "cron_job", "timestamp": "' || now()::text || '"}'::jsonb
    ) as request_id;
  $$
);

-- Verify the cron job was created successfully
SELECT jobname, schedule, command FROM cron.job WHERE jobname = 'daily-ranking-check';
