-- Add temporary policy for testing to view all ranking requests
-- This allows viewing all requests for debugging purposes
CREATE POLICY "Allow viewing all requests for testing" 
ON public.ranking_requests 
FOR SELECT 
USING (true);