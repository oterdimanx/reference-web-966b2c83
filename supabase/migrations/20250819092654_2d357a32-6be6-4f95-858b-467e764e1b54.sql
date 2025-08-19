-- Create cron execution logs table
CREATE TABLE public.cron_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL,
  execution_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  processed_requests INTEGER DEFAULT 0,
  execution_duration INTERVAL,
  error_message TEXT,
  response_data JSONB,
  request_source TEXT DEFAULT 'cron',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cron_execution_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for system to insert logs
CREATE POLICY "System can insert cron logs" 
ON public.cron_execution_logs 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admins to view logs
CREATE POLICY "Admins can view cron logs" 
ON public.cron_execution_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Delete existing broken cron job
SELECT cron.unschedule('schedule-rankings-daily');

-- Create new cron job with proper JSON syntax
SELECT cron.schedule(
  'schedule-rankings-daily',
  '0 2 * * *', -- Daily at 2 AM
  $$
  SELECT
    net.http_post(
      url:='https://jixmwjplysaqlyzhpcmk.supabase.co/functions/v1/schedule-rankings',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeG13anBseXNhcWx5emhwY21rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQzNzYyNCwiZXhwIjoyMDYyMDEzNjI0fQ.KuvbemiiLfpGDdb5D0DhBoWKhf8IUERILlUqJcIoOXw'
      ),
      body:=jsonb_build_object(
        'triggered_by', 'cron',
        'execution_time', now()::text
      )
    ) as request_id;
  $$
);

-- Create backup/test cron job (disabled by default)
SELECT cron.schedule(
  'schedule-rankings-test',
  '0 3 * * *', -- Daily at 3 AM (1 hour after main job)
  $$
  SELECT
    net.http_post(
      url:='https://jixmwjplysaqlyzhpcmk.supabase.co/functions/v1/schedule-rankings',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeG13anBseXNhcWx5emhwY21rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQzNzYyNCwiZXhwIjoyMDYyMDEzNjI0fQ.KuvbemiiLfpGDdb5D0DhBoWKhf8IUERILlUqJcIoOXw'
      ),
      body:=jsonb_build_object(
        'triggered_by', 'cron_test',
        'execution_time', now()::text
      )
    ) as request_id;
  $$
);

-- Disable test job by default
SELECT cron.unschedule('schedule-rankings-test');

-- Create view for monitoring cron job health
CREATE OR REPLACE VIEW public.cron_job_health AS
SELECT 
  job_name,
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_executions,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_executions,
  MAX(execution_time) as last_execution,
  AVG(EXTRACT(EPOCH FROM execution_duration)) as avg_duration_seconds,
  SUM(processed_requests) as total_processed_requests
FROM public.cron_execution_logs 
WHERE execution_time >= now() - interval '7 days'
GROUP BY job_name;

-- Create function to enable/disable cron jobs for rollback
CREATE OR REPLACE FUNCTION public.manage_cron_job(job_name TEXT, action TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF action = 'disable' THEN
    PERFORM cron.unschedule(job_name);
    RETURN 'Cron job ' || job_name || ' disabled successfully';
  ELSIF action = 'enable_main' THEN
    PERFORM cron.schedule(
      'schedule-rankings-daily',
      '0 2 * * *',
      $$
      SELECT
        net.http_post(
          url:='https://jixmwjplysaqlyzhpcmk.supabase.co/functions/v1/schedule-rankings',
          headers:=jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeG13anBseXNhcWx5emhwY21rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQzNzYyNCwiZXhwIjoyMDYyMDEzNjI0fQ.KuvbemiiLfpGDdb5D0DhBoWKhf8IUERILlUqJcIoOXw'
          ),
          body:=jsonb_build_object(
            'triggered_by', 'cron',
            'execution_time', now()::text
          )
        ) as request_id;
      $$
    );
    RETURN 'Main cron job enabled successfully';
  ELSIF action = 'enable_test' THEN
    PERFORM cron.schedule(
      'schedule-rankings-test',
      '0 3 * * *',
      $$
      SELECT
        net.http_post(
          url:='https://jixmwjplysaqlyzhpcmk.supabase.co/functions/v1/schedule-rankings',
          headers:=jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeG13anBseXNhcWx5emhwY21rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQzNzYyNCwiZXhwIjoyMDYyMDEzNjI0fQ.KuvbemiiLfpGDdb5D0DhBoWKhf8IUERILlUqJcIoOXw'
          ),
          body:=jsonb_build_object(
            'triggered_by', 'cron_test',
            'execution_time', now()::text
          )
        ) as request_id;
      $$
    );
    RETURN 'Test cron job enabled successfully';
  ELSE
    RETURN 'Invalid action. Use: disable, enable_main, or enable_test';
  END IF;
END;
$$;