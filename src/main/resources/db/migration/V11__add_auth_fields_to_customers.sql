UPDATE customers
SET email = CONCAT('customer_', id, '@example.local')
WHERE email IS NULL OR email = '';

ALTER TABLE customers
    ALTER COLUMN email SET NOT NULL;

ALTER TABLE customers
    ADD CONSTRAINT uk_customers_email UNIQUE (email);

ALTER TABLE customers
    ADD COLUMN password VARCHAR(255);