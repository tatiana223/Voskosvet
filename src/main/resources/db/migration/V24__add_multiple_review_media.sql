ALTER TABLE reviews
    ADD COLUMN media_data TEXT;

UPDATE reviews
SET media_data = image_url || '|image'
WHERE image_url IS NOT NULL AND image_url <> '';
