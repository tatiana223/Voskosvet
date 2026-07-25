ALTER TABLE candles
ADD COLUMN featured BOOLEAN;

UPDATE candles
SET featured = FALSE
WHERE featured IS NULL;

ALTER TABLE candles
ALTER COLUMN featured SET NOT NULL;