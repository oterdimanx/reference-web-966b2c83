-- Add missing foreign key constraint between ranking_requests and websites
ALTER TABLE public.ranking_requests 
ADD CONSTRAINT fk_ranking_requests_website_id 
FOREIGN KEY (website_id) REFERENCES public.websites(id) ON DELETE CASCADE;