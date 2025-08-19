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

-- Create policies
CREATE POLICY "System can insert cron logs" 
ON public.cron_execution_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view cron logs" 
ON public.cron_execution_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Delete existing broken cron job
SELECT cron.unschedule('schedule-rankings-daily');

-- Create new cron job with proper JSON syntax using service role key
SELECT cron.schedule(
  'schedule-rankings-daily',
  '0 2 * * *',
  'SELECT net.http_post(url:=''https://jixmwjplysaqlyzhpcmk.supabase.co/functions/v1/schedule-rankings'', headers:=''{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeG13anBseXNhcWx5emhwY21rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQzNzYyNCwiZXhwIjoyMDYyMDEzNjI0fQ.KuvbemiiLfpGDdb5D0DhBoWKhf8IUERILlUqJcIoOXw"}''::jsonb, body:=''{"triggered_by": "cron"}''::jsonb) as request_id;'
);

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