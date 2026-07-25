ALTER TABLE categories
ADD COLUMN active BOOLEAN;

UPDATE categories
SET active = TRUE
WHERE active IS NULL;

ALTER TABLE categories
ALTER COLUMN active SET NOT NULL;
