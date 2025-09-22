-- Migrate existing domains to standardized format
UPDATE public.websites 
SET domain = normalize_domain(domain) 
WHERE domain != normalize_domain(domain);

UPDATE public.directory_websites 
SET domain = normalize_domain(domain) 
WHERE domain != normalize_domain(domain);