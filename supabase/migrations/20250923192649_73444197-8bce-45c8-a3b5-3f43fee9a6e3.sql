-- Create storage bucket for website images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('website-images', 'website-images', true);

-- Create RLS policies for website images
CREATE POLICY "Website images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'website-images');

CREATE POLICY "Users can upload website images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'website-images');

CREATE POLICY "Users can update their own website images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'website-images');

CREATE POLICY "Users can delete their own website images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'website-images');