-- Remove the insecure temporary policy
DROP POLICY "Allow viewing all requests for testing" ON public.ranking_requests;

-- Add proper admin policy for ranking requests
CREATE POLICY "Admins can view all ranking requests" 
ON public.ranking_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));