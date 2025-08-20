-- Fix search path for the functions I just created
CREATE OR REPLACE FUNCTION normalize_domain(input_domain text) 
RETURNS text 
LANGUAGE plpgsql 
IMMUTABLE 
SET search_path TO 'public'
AS $$
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

CREATE OR REPLACE FUNCTION normalize_directory_domain()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.domain = normalize_domain(NEW.domain);
  RETURN NEW;
END;
$$;