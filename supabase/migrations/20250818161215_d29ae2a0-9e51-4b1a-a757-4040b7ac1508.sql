-- Create ranking_requests table for queuing ranking update requests
CREATE TABLE public.ranking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  website_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_keyword_preferences table for user-specific keyword settings
CREATE TABLE public.user_keyword_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  website_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  difficulty_estimate TEXT NULL,
  volume_estimate TEXT NULL,
  notes TEXT NULL,
  is_priority BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, website_id, keyword)
);

-- Enable Row Level Security
ALTER TABLE public.ranking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_keyword_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for ranking_requests
CREATE POLICY "Users can view their own ranking requests" 
ON public.ranking_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ranking requests" 
ON public.ranking_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ranking requests" 
ON public.ranking_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can update all ranking requests" 
ON public.ranking_requests 
FOR UPDATE 
USING (true);

-- Create policies for user_keyword_preferences
CREATE POLICY "Users can manage their own keyword preferences" 
ON public.user_keyword_preferences 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_ranking_requests_status ON public.ranking_requests(status);
CREATE INDEX idx_ranking_requests_user_id ON public.ranking_requests(user_id);
CREATE INDEX idx_ranking_requests_website_id ON public.ranking_requests(website_id);
CREATE INDEX idx_user_keyword_preferences_user_website ON public.user_keyword_preferences(user_id, website_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_ranking_requests_updated_at
BEFORE UPDATE ON public.ranking_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_keyword_preferences_updated_at
BEFORE UPDATE ON public.user_keyword_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();