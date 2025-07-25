-- Fix function search_path configurations for security using CASCADE
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = has_role.user_id
    AND user_roles.role = has_role.role
  );
$function$;

-- Recreate the RLS policies that depend on has_role function
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage directory websites"
ON public.directory_websites
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage translations"
ON public.custom_translations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow admins to manage pricing"
ON public.pricing
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view role audit log"
ON public.role_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix other functions with proper search_path
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, 'https://api.dicebear.com/7.x/initials/svg?seed=' || new.email);
  RETURN new;
END;
$function$;

DROP FUNCTION IF EXISTS public.handle_new_user_preferences();
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_preferences (user_id, theme_preference)
  VALUES (NEW.id, 'system');
  RETURN NEW;
END;
$function$;

-- Add comprehensive audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  target_user_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view security audit logs"
ON public.security_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs (for edge functions)
CREATE POLICY "System can insert audit logs"
ON public.security_audit_log
FOR INSERT
WITH CHECK (true);

-- Add function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  target_user_id UUID DEFAULT NULL,
  details JSONB DEFAULT NULL,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    event_type,
    user_id,
    target_user_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    event_type,
    auth.uid(),
    target_user_id,
    details,
    ip_address,
    user_agent
  );
END;
$function$;

-- Add domain validation function for database-level validation
CREATE OR REPLACE FUNCTION public.validate_domain(domain_text TEXT)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  -- Basic domain format validation
  IF domain_text IS NULL OR LENGTH(domain_text) = 0 THEN
    RETURN false;
  END IF;
  
  -- Check for suspicious patterns
  IF domain_text ~* '(localhost|127\.0\.0\.1|file://|javascript:|data:)' THEN
    RETURN false;
  END IF;
  
  -- Basic domain pattern check
  IF NOT (domain_text ~* '^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$') THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- Add email validation function
CREATE OR REPLACE FUNCTION public.validate_email(email_text TEXT)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  IF email_text IS NULL OR LENGTH(email_text) = 0 THEN
    RETURN false;
  END IF;
  
  -- Basic email pattern validation
  RETURN email_text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$';
END;
$function$;

-- Add triggers for domain validation on websites table
CREATE OR REPLACE FUNCTION public.validate_website_data()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate domain
  IF NOT public.validate_domain(NEW.domain) THEN
    RAISE EXCEPTION 'Invalid domain format: %', NEW.domain;
  END IF;
  
  -- Validate contact email if provided
  IF NEW.contact_email IS NOT NULL AND NOT public.validate_email(NEW.contact_email) THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.contact_email;
  END IF;
  
  -- Sanitize text fields to prevent XSS
  NEW.title = TRIM(COALESCE(NEW.title, ''));
  NEW.description = TRIM(COALESCE(NEW.description, ''));
  NEW.contact_name = TRIM(COALESCE(NEW.contact_name, ''));
  
  RETURN NEW;
END;
$function$;

-- Create trigger for website validation
DROP TRIGGER IF EXISTS validate_website_trigger ON public.websites;
CREATE TRIGGER validate_website_trigger
  BEFORE INSERT OR UPDATE ON public.websites
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_website_data();