-- Create contact table for storing contact form submissions
CREATE TABLE public.contact (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL REFERENCES auth.users(id),
  contact_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mes droits', 'support')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own contact messages" 
ON public.contact 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own contact messages" 
ON public.contact 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contact messages" 
ON public.contact 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_contact_updated_at
BEFORE UPDATE ON public.contact
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();