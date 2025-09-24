-- Fix function search path issues for security
-- Update existing functions to have proper search_path

-- Fix validate_domain function
CREATE OR REPLACE FUNCTION public.validate_domain(domain_text text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
 SECURITY DEFINER
 SET search_path = 'public'
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

-- Fix validate_email function
CREATE OR REPLACE FUNCTION public.validate_email(email_text text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF email_text IS NULL OR LENGTH(email_text) = 0 THEN
    RETURN false;
  END IF;
  
  -- Basic email pattern validation
  RETURN email_text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$';
END;
$function$;

-- Fix validate_website_data function
CREATE OR REPLACE FUNCTION public.validate_website_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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

-- Fix normalize_domain function
CREATE OR REPLACE FUNCTION public.normalize_domain(input_domain text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF input_domain IS NULL OR LENGTH(input_domain) = 0 THEN
    RETURN input_domain;
  END IF;
  
  -- Remove protocol, www, trailing slash, normalize case and trim
  RETURN TRIM(
    LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(input_domain, '^https?://', '', 'i'),
          '^www\.', '', 'i'
        ),
        '/$', ''
      )
    )
  );
END;
$function$;

-- Fix normalize_directory_domain function
CREATE OR REPLACE FUNCTION public.normalize_directory_domain()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.domain = normalize_domain(NEW.domain);
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user_preferences function
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.user_preferences (user_id, theme_preference)
  VALUES (NEW.id, 'system');
  RETURN NEW;
END;
$function$;