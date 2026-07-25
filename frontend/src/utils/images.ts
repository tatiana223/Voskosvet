const seededImageReplacements: Record<string, string> = {
  '/images/candles/vanilla-cloud.jpg': '/images/candle-detail.png',
  '/images/candles/lavender-evening.jpg': '/images/about-natural-candle.png',
  '/images/candles/warm-cashmere.jpg': '/images/hero-natural-candle.png',
  '/images/candles/marble-column.jpg': '/images/candle-size.png',
  '/images/candles/cozy-home-set.jpg': '/images/gift-box.png',
};

export function getCandleImage(imageUrl: string | undefined) {
  if (!imageUrl) {
    return '/images/hero-natural-candle.png';
  }

  return seededImageReplacements[imageUrl] || imageUrl;
}

export function useCandleImageFallback(event: { currentTarget: HTMLImageElement }) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = '/images/hero-natural-candle.png';
}
