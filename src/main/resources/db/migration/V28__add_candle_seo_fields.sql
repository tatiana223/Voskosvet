ALTER TABLE candles
    ADD COLUMN seo_title VARCHAR(160),
    ADD COLUMN seo_description VARCHAR(320),
    ADD COLUMN material VARCHAR(160),
    ADD COLUMN wick_type VARCHAR(160),
    ADD COLUMN usage_instructions VARCHAR(1000);

UPDATE candles
SET material = 'Натуральный пчелиный воск'
WHERE material IS NULL;

CREATE TABLE candle_image_alts (
    candle_id BIGINT NOT NULL REFERENCES candles(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(300) NOT NULL,
    PRIMARY KEY (candle_id, image_url)
);
