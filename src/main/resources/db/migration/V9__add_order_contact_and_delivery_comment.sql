ALTER TABLE orders
ADD COLUMN preferred_contact_method VARCHAR(255);

ALTER TABLE orders
ADD COLUMN delivery_comment VARCHAR(255);

UPDATE orders
SET preferred_contact_method = 'PHONE'
WHERE preferred_contact_method IS NULL;

ALTER TABLE orders
ALTER COLUMN preferred_contact_method SET NOT NULL;
