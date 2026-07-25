const seededImageReplacements: Record<string, string> = {
  '/images/candles/vanilla-cloud.jpg': '/images/candle-detail.webp',
  '/images/candles/lavender-evening.jpg': '/images/about-natural-candle.webp',
  '/images/candles/warm-cashmere.jpg': '/images/hero-natural-candle.webp',
  '/images/candles/marble-column.jpg': '/images/candle-size.webp',
  '/images/candles/cozy-home-set.jpg': '/images/gift-box.webp',
};

export function getCandleImage(imageUrl: string | undefined) {
  if (!imageUrl) {
    return '/images/hero-natural-candle.webp';
  }

  return seededImageReplacements[imageUrl] || imageUrl;
}

export function useCandleImageFallback(event: { currentTarget: HTMLImageElement }) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = '/images/hero-natural-candle.webp';
}
