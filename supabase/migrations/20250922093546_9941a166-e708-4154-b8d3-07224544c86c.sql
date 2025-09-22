-- Add enhanced ranking fields to ranking_snapshots table
ALTER TABLE public.ranking_snapshots 
ADD COLUMN search_depth INTEGER DEFAULT 100,
ADD COLUMN ranking_confidence TEXT DEFAULT 'high',
ADD COLUMN last_deep_search_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_priority_keyword BOOLEAN DEFAULT false;

-- Add deep search settings to user_keyword_preferences
ALTER TABLE public.user_keyword_preferences 
ADD COLUMN last_deep_search_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN deep_search_enabled BOOLEAN DEFAULT false;

-- Create a system settings table for global configuration
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for system_settings
CREATE POLICY "Admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (true);

-- Insert default deep search settings
INSERT INTO public.system_settings (setting_key, setting_value) VALUES 
('deep_search_max_results', '300'),
('deep_search_cooldown_hours', '168'), -- 1 week
('deep_search_batch_size', '100');

-- Add trigger for updated_at on system_settings
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();