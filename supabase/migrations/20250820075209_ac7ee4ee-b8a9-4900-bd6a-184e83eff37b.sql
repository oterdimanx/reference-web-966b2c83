-- Normalize existing domains in directory_websites table
UPDATE public.directory_websites 
SET domain = TRIM(
  LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(domain, '^https?://', '', 'i'),
      '^www\.', '', 'i'
    )
  )
)
WHERE domain ~ '^https?://' OR domain ~ '^www\.';

-- Add a check to ensure domains are properly formatted going forward
CREATE OR REPLACE FUNCTION normalize_domain(input_domain text) 
RETURNS text 
LANGUAGE plpgsql 
IMMUTABLE AS $$
BEGIN
  IF input_domain IS NULL OR LENGTH(input_domain) = 0 THEN
    RETURN input_domain;
  END IF;
  
  -- Remove protocol, www, trailing slash, normalize case and trim
  RETURN TRIM(
    LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(input_domain, '^https?://', '', 'i'),
          '^www\.', '', 'i'
        ),
        '/$', ''
      )
    )
  );
END;
$$;

-- Create trigger to automatically normalize domains on insert/update
CREATE OR REPLACE FUNCTION normalize_directory_domain()
RETURNS TRIGGER AS $$
BEGIN
  NEW.domain = normalize_domain(NEW.domain);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS normalize_directory_domain_trigger ON public.directory_websites;
CREATE TRIGGER normalize_directory_domain_trigger
  BEFORE INSERT OR UPDATE ON public.directory_websites
  FOR EACH ROW
  EXECUTE FUNCTION normalize_directory_domain();