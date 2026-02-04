-- Update the photo_url column to support large base64 images
-- This script should be run if the column already exists with VARCHAR type

USE neurofleetx_db;

-- Check if column exists and modify it
ALTER TABLE users MODIFY COLUMN photo_url LONGTEXT;

-- Verify the change
DESCRIBE users;
