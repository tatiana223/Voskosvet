ALTER TABLE orders
ADD COLUMN delivery_method VARCHAR(255);

ALTER TABLE orders
ADD COLUMN city VARCHAR(255);

ALTER TABLE orders
ADD COLUMN delivery_address VARCHAR(255);

ALTER TABLE orders
ADD COLUMN payment_method VARCHAR(255);

UPDATE orders
SET delivery_method = 'PICKUP'
WHERE delivery_method IS NULL;

UPDATE orders
SET payment_method = 'TRANSFER'
WHERE payment_method IS NULL;

ALTER TABLE orders
ALTER COLUMN delivery_method SET NOT NULL;

ALTER TABLE orders
ALTER COLUMN payment_method SET NOT NULL;