ALTER TABLE customers
    ADD COLUMN primary_admin BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE customers
SET role = 'ADMIN',
    primary_admin = TRUE
WHERE id = (
    SELECT id
    FROM customers
    WHERE LOWER(TRIM(full_name)) = LOWER('Якимова Марина Евгеньевна')
    ORDER BY id
    LIMIT 1
);

CREATE UNIQUE INDEX uq_customers_primary_admin
    ON customers (primary_admin)
    WHERE primary_admin = TRUE;
