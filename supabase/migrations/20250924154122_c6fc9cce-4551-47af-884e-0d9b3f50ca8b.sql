-- Fix remaining functions that need search_path set

-- Update log_role_changes function
CREATE OR REPLACE FUNCTION public.log_role_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.role_audit_log (user_id, granted_role, granted_by)
  VALUES (NEW.user_id, NEW.role, auth.uid());
  RETURN NEW;
END;
$function$;

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = has_role.user_id
    AND user_roles.role = has_role.role
  );
$function$;

-- Update log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, target_user_id uuid DEFAULT NULL::uuid, details jsonb DEFAULT NULL::jsonb, ip_address inet DEFAULT NULL::inet, user_agent text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, 'https://api.dicebear.com/7.x/initials/svg?seed=' || new.email);
  RETURN new;
END;
$function$;