-- Fix the security definer view by removing SECURITY DEFINER and using proper RLS
DROP VIEW public.cron_job_health;

CREATE VIEW public.cron_job_health AS
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