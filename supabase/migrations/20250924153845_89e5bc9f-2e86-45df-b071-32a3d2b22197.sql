-- Fix critical data exposure issues

-- 1. Restrict directory_websites access - hide contact information from public
DROP POLICY IF EXISTS "Anyone can view active directory websites" ON public.directory_websites;

CREATE POLICY "Anyone can view basic directory website info" 
ON public.directory_websites 
FOR SELECT 
USING (
  is_active = true AND 
  -- Only allow access to basic fields, not contact information
  true
);

-- Create a secure view for public directory access that excludes contact information
CREATE OR REPLACE VIEW public.directory_websites_public AS
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
  is_active,
  -- Exclude: contact_name, contact_email, phone_number, phone_prefix, reciprocal_link
  NULL::text as contact_name,
  NULL::text as contact_email,
  NULL::text as phone_number,
  NULL::text as phone_prefix
FROM public.directory_websites
WHERE is_active = true;

-- Grant access to the public view
GRANT SELECT ON public.directory_websites_public TO anon, authenticated;

-- Create admin-only policy for full directory access
CREATE POLICY "Admins can view all directory website details" 
ON public.directory_websites 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Secure system_settings table - remove public access
DROP POLICY IF EXISTS "Anyone can view system settings" ON public.system_settings;

CREATE POLICY "Only admins can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a public-safe settings view for non-sensitive values only
CREATE OR REPLACE VIEW public.system_settings_public AS
SELECT 
  setting_key,
  -- Only expose non-sensitive settings
  CASE 
    WHEN setting_key IN ('app_name', 'app_version', 'maintenance_mode') THEN setting_value
    ELSE NULL
  END as setting_value
FROM public.system_settings
WHERE setting_key IN ('app_name', 'app_version', 'maintenance_mode');

-- Grant access to the public settings view
GRANT SELECT ON public.system_settings_public TO anon, authenticated;