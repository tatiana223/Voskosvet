ALTER TABLE customers ADD COLUMN normalized_phone VARCHAR(32);

UPDATE customers
SET normalized_phone = CASE
    WHEN LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) = 11
         AND LEFT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 1) = '8'
        THEN '7' || SUBSTRING(REGEXP_REPLACE(phone, '[^0-9]', '', 'g') FROM 2)
    WHEN LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) = 10
        THEN '7' || REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
    ELSE REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
END;

ALTER TABLE customers ALTER COLUMN normalized_phone SET NOT NULL;
CREATE INDEX idx_customers_normalized_phone ON customers(normalized_phone);
