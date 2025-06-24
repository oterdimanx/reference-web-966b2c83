
-- Create RLS policies for the events table to allow public tracking
CREATE POLICY "Allow public insert for event tracking" 
  ON public.events 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow admins to view all events
CREATE POLICY "Allow authenticated users to view events" 
  ON public.events 
  FOR SELECT 
  USING (auth.role() = 'authenticated');
