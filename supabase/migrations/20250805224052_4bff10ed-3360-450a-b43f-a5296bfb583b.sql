-- Update RLS policy to allow admins to view all websites
DROP POLICY IF EXISTS "Users can view their own websites" ON public.websites;

CREATE POLICY "Users can view their own websites" ON public.websites
FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));