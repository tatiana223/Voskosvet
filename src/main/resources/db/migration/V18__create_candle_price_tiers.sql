CREATE TABLE candle_price_tiers (
    candle_id BIGINT NOT NULL REFERENCES candles(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 1),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price > 0),
    PRIMARY KEY (candle_id, quantity)
);

