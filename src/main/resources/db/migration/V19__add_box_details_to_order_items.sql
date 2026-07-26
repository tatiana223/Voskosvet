ALTER TABLE order_items
    ADD COLUMN package_size INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN box_quantity INTEGER NOT NULL DEFAULT 1;

UPDATE order_items
SET package_size = quantity;
