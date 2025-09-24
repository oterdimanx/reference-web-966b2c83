-- Add priority_level column to contact table
ALTER TABLE public.contact 
ADD COLUMN priority_level text DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high'));

-- Update RLS policies to allow admins to manage contact messages
CREATE POLICY "Admins can update contact messages" 
ON public.contact 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contact messages" 
ON public.contact 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));