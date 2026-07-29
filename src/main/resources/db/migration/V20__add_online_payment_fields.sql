ALTER TABLE orders ADD COLUMN payment_status VARCHAR(30) NOT NULL DEFAULT 'NOT_REQUIRED';
ALTER TABLE orders ADD COLUMN external_payment_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP;

CREATE UNIQUE INDEX idx_orders_external_payment_id
    ON orders(external_payment_id);

UPDATE orders
SET payment_status = 'PENDING'
WHERE payment_method = 'CARD_ONLINE';

