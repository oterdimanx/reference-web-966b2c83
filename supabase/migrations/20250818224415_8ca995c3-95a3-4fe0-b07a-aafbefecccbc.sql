-- Add tagging and grouping columns to user_keyword_preferences
ALTER TABLE user_keyword_preferences 
ADD COLUMN tags text[],
ADD COLUMN group_name text,
ADD COLUMN group_color text;

-- Create indexes for better performance
CREATE INDEX idx_user_keyword_preferences_group_name ON user_keyword_preferences(group_name);
CREATE INDEX idx_user_keyword_preferences_tags ON user_keyword_preferences USING GIN(tags);