-- Update RLS policy on ranking_snapshots to allow admin access
DROP POLICY IF EXISTS "Users can view snapshots for their websites" ON public.ranking_snapshots;

CREATE POLICY "Users can view snapshots for their websites" 
ON public.ranking_snapshots 
FOR SELECT 
USING (
  EXISTS ( 
    SELECT 1
    FROM websites
    WHERE (
      (websites.id = ranking_snapshots.website_id) 
      AND (
        (websites.user_id = auth.uid()) 
        OR has_role(auth.uid(), 'admin'::app_role)
      )
    )
  )
);