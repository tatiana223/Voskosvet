ALTER TABLE candles
ADD COLUMN slug VARCHAR(255);

UPDATE candles
SET slug = LOWER(REPLACE(name, ' ', '-'))
WHERE slug IS NULL;

ALTER TABLE candles
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE candles
ADD CONSTRAINT uk_candles_slug UNIQUE (slug);