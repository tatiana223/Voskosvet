CREATE TABLE candle_images (
    candle_id BIGINT NOT NULL REFERENCES candles(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    sort_order INTEGER NOT NULL,
    PRIMARY KEY (candle_id, sort_order)
);

INSERT INTO candle_images (candle_id, image_url, sort_order)
SELECT id, image_url, 0
FROM candles
WHERE image_url IS NOT NULL AND BTRIM(image_url) <> '';

ALTER TABLE candle_price_tiers
    ADD COLUMN image_url VARCHAR(255);
