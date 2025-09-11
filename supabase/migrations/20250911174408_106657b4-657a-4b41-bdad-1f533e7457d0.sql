-- Enable Row Level Security on the cron_job_health view
ALTER TABLE public.cron_job_health ENABLE ROW LEVEL SECURITY;

-- Create policy to restrict access to admins only
CREATE POLICY "Admins can view cron job health" 
ON public.cron_job_health 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));