ALTER TABLE reviews
    ADD COLUMN featured BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE reviews
SET featured = TRUE
WHERE id IN (
    SELECT id
    FROM reviews
    ORDER BY created_at DESC
    LIMIT 3
);
