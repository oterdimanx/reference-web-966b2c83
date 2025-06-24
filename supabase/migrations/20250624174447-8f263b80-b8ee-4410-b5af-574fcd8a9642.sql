
-- Add foreign key constraint to ensure referential integrity
ALTER TABLE directory_websites 
ADD CONSTRAINT fk_directory_websites_category 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;

-- Add a unique constraint to category names to prevent duplicates
ALTER TABLE categories 
ADD CONSTRAINT unique_category_name UNIQUE (name);
