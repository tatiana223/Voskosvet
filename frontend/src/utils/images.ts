const seededImageReplacements: Record<string, string> = {
  '/images/candles/vanilla-cloud.jpg': '/images/candle-detail.webp',
  '/images/candles/lavender-evening.jpg': '/images/about-natural-candle.webp',
  '/images/candles/warm-cashmere.jpg': '/images/hero-natural-candle.webp',
  '/images/candles/marble-column.jpg': '/images/candle-size.webp',
  '/images/candles/cozy-home-set.jpg': '/images/gift-box.webp',
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export function getUploadedImage(imageUrl: string | undefined) {
  if (imageUrl?.startsWith('/api/media/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return imageUrl;
}

export function getCandleImage(imageUrl: string | undefined) {
  if (!imageUrl) {
    return '/images/hero-natural-candle.webp';
  }

  return getUploadedImage(seededImageReplacements[imageUrl] || imageUrl);
}

export function getCandleGallery(candle: {
  imageUrl?: string;
  imageUrls?: string[];
  priceTiers?: Array<{ imageUrl?: string }>;
}) {
  const urls = [
    candle.imageUrl,
    ...(candle.imageUrls || []),
    ...(candle.priceTiers || []).map((tier) => tier.imageUrl),
  ].filter((url): url is string => Boolean(url));

  return [...new Set(urls)].map(getCandleImage);
}

export function getCandleRawGallery(candle: {
  imageUrl?: string;
  imageUrls?: string[];
  priceTiers?: Array<{ imageUrl?: string }>;
}) {
  return [...new Set([
    candle.imageUrl,
    ...(candle.imageUrls || []),
    ...(candle.priceTiers || []).map((tier) => tier.imageUrl),
  ].filter((url): url is string => Boolean(url)))];
}

export function useCandleImageFallback(event: { currentTarget: HTMLImageElement }) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = '/images/hero-natural-candle.webp';
}
