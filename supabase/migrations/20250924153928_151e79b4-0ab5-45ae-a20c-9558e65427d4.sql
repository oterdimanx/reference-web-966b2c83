-- Fix security definer view issues by making them security invoker
DROP VIEW IF EXISTS public.directory_websites_public;
DROP VIEW IF EXISTS public.system_settings_public;

-- Create security invoker views (default behavior)
CREATE VIEW public.directory_websites_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  domain,
  title,
  description,
  image_path,
  category_id,
  avg_position,
  position_change,
  keyword_count,
  top_keyword,
  top_keyword_position,
  created_at,
  updated_at,
  is_active
FROM public.directory_websites
WHERE is_active = true;

CREATE VIEW public.system_settings_public 
WITH (security_invoker = true) AS
SELECT 
  setting_key,
  CASE 
    WHEN setting_key IN ('app_name', 'app_version', 'maintenance_mode') THEN setting_value
    ELSE NULL
  END as setting_value
FROM public.system_settings
WHERE setting_key IN ('app_name', 'app_version', 'maintenance_mode');

-- Grant appropriate access
GRANT SELECT ON public.directory_websites_public TO anon, authenticated;
GRANT SELECT ON public.system_settings_public TO anon, authenticated;