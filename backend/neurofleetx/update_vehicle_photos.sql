-- Update the vehicle photo columns to support large base64 images
-- This script should be run if the columns already exist with VARCHAR type

USE neurofleetx_db;

-- Check if columns exist and modify them
ALTER TABLE vehicles MODIFY COLUMN driver_photo LONGTEXT;
ALTER TABLE vehicles MODIFY COLUMN vehicle_photo LONGTEXT;

-- Verify the change
DESCRIBE vehicles;
