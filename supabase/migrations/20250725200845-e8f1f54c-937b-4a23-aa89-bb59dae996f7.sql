-- Fix critical privilege escalation vulnerability in user_roles table
-- Remove the dangerous OR condition that allows self-privilege escalation

-- Drop the existing insecure policy
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;

-- Create a secure policy that only allows existing admins to grant roles
CREATE POLICY "Only admins can insert roles" ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add audit logging for role changes
CREATE TABLE IF NOT EXISTS public.role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  granted_role app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  action TEXT NOT NULL DEFAULT 'GRANTED'
);

-- Enable RLS on audit log
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view role audit log" ON public.role_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger function for role audit logging
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.role_audit_log (user_id, granted_role, granted_by)
  VALUES (NEW.user_id, NEW.role, auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role changes
CREATE TRIGGER role_audit_trigger
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_changes();

-- Fix database function security by setting proper search_path
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_new_user_preferences() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;