
-- Drop the existing policy and recreate it with better permissions
DROP POLICY IF EXISTS "Allow public insert for event tracking" ON public.events;

-- Create a policy that specifically allows anonymous inserts for event tracking
CREATE POLICY "Allow anonymous insert for event tracking" 
  ON public.events 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Also create a policy for authenticated users to insert events
CREATE POLICY "Allow authenticated insert for event tracking" 
  ON public.events 
  FOR INSERT 
  TO authenticated  
  WITH CHECK (true);
