-- Add Post Me customizable fields to user_portfolios table
ALTER TABLE user_portfolios 
ADD COLUMN post_me_title TEXT,
ADD COLUMN post_me_subtitle TEXT,
ADD COLUMN post_me_email_placeholder TEXT,
ADD COLUMN post_me_message_placeholder TEXT,
ADD COLUMN post_me_button_text TEXT,
ADD COLUMN post_me_success_message TEXT,
ADD COLUMN post_me_error_message TEXT;

-- Add comments for documentation
COMMENT ON COLUMN user_portfolios.post_me_title IS 'Customizable title for Post Me section';
COMMENT ON COLUMN user_portfolios.post_me_subtitle IS 'Customizable subtitle for Post Me section';
COMMENT ON COLUMN user_portfolios.post_me_email_placeholder IS 'Customizable placeholder for email input';
COMMENT ON COLUMN user_portfolios.post_me_message_placeholder IS 'Customizable placeholder for message textarea';
COMMENT ON COLUMN user_portfolios.post_me_button_text IS 'Customizable text for submit button';
COMMENT ON COLUMN user_portfolios.post_me_success_message IS 'Customizable success message';
COMMENT ON COLUMN user_portfolios.post_me_error_message IS 'Customizable error message'; 