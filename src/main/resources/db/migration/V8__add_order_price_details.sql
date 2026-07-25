ALTER TABLE orders
ADD COLUMN items_price NUMERIC(19, 2);

ALTER TABLE orders
ADD COLUMN delivery_price NUMERIC(19, 2);

UPDATE orders
SET items_price = total_price
WHERE items_price IS NULL;

UPDATE orders
SET delivery_price = 0
WHERE delivery_price IS NULL;

ALTER TABLE orders
ALTER COLUMN items_price SET NOT NULL;

ALTER TABLE orders
ALTER COLUMN delivery_price SET NOT NULL;
