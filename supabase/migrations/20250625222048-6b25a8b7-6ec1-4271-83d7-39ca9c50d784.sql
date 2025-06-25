
-- Enable the required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a daily cron job to check rankings at 2 AM UTC
SELECT cron.schedule(
  'daily-ranking-check',
  '0 2 * * *', -- Run daily at 2 AM UTC (cron format: minute hour day month day_of_week)
  $$
  SELECT
    net.http_post(
        url:='https://jixmwjplysaqlyzhpcmk.supabase.co/functions/v1/schedule-rankings',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeG13anBseXNhcWx5emhwY21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0Mzc2MjQsImV4cCI6MjA2MjAxMzYyNH0.oV09rw5jJbHl0eS_0HSmZ-6K0U0m6rxTeEK80h7fHwo"}'::jsonb,
        body:='{"source": "cron_job"}'::jsonb
    ) as request_id;
  $$
);

-- Optional: View all scheduled cron jobs to verify it was created
-- SELECT * FROM cron.job;

-- Optional: To delete the cron job later, you can use:
-- SELECT cron.unschedule('daily-ranking-check');
