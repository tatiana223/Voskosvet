import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Candle } from '../types/candle';
import {
  addToCart,
  getCandleSavingPercent,
  getCandleUnitPrice,
  getDefaultPackageSize,
} from '../utils/cart';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { getStoredAuth, subscribeToAuth } from '../utils/auth';
import { getCandleGallery, getCandleImage, useCandleImageFallback } from '../utils/images';

type CandleCardProps = {
  candle: Candle;
  index?: number;
};

export function CandleCard({ candle }: CandleCardProps) {
  const gallery = getCandleGallery(candle);
  const [imageIndex, setImageIndex] = useState(0);
  const [favorite, setFavorite] = useState(() => isFavorite(candle.id));
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [packageSize, setPackageSize] = useState(() => getDefaultPackageSize(candle));
  const [isAdded, setIsAdded] = useState(false);
  const unitPrice = getCandleUnitPrice(candle, packageSize);
  const saving = getCandleSavingPercent(candle, unitPrice);

  useEffect(() => subscribeToAuth(() => {
    setAuth(getStoredAuth());
    setFavorite(isFavorite(candle.id));
  }), [candle.id]);

  function showImage(step: number) {
    setImageIndex((current) => (current + step + gallery.length) % gallery.length);
  }

  function selectPackage(quantity: number, imageUrl?: string) {
    setPackageSize(quantity);
    if (imageUrl) {
      const nextIndex = gallery.indexOf(getCandleImage(imageUrl));
      if (nextIndex >= 0) setImageIndex(nextIndex);
    }
  }

  function handleAddToCart() {
    addToCart(candle, packageSize, 1);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1400);
  }

  return (
    <article className={`candle-card${isAdded ? ' candle-card--added' : ''}`}>
      {auth ? (
        <button
          className={`favorite-button${favorite ? ' favorite-button--active' : ''}`}
          type="button"
          aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          aria-pressed={favorite}
          onClick={() => setFavorite(toggleFavorite(candle))}
        >
          {favorite ? '♥' : '♡'}
        </button>
      ) : null}
      <div className="candle-image">
        <Link className="candle-image-link" to={`/catalog/${candle.slug}`}>
          <img src={gallery[imageIndex]} alt={candle.name} onError={useCandleImageFallback} />
        </Link>
        {candle.featured ? <span className="featured-badge">Хит продаж</span> : null}
        {gallery.length > 1 ? (
          <>
            <button className="gallery-arrow gallery-arrow--prev" type="button" aria-label="Предыдущее фото" onClick={() => showImage(-1)}>‹</button>
            <button className="gallery-arrow gallery-arrow--next" type="button" aria-label="Следующее фото" onClick={() => showImage(1)}>›</button>
            <span className="gallery-counter">{imageIndex + 1}/{gallery.length}</span>
          </>
        ) : null}
      </div>

      <div className="candle-card-body">
        <h3>{candle.name}</h3>
        <p>{candle.shortDescription || '100% пчелиный воск'}</p>
        <div className="card-footer">
          {(candle.priceTiers || []).length > 0 ? (
            <div className="card-package-picker" aria-label="Размер коробки">
              {candle.priceTiers.map((tier) => (
                <button
                  className={packageSize === tier.quantity ? 'card-package-option card-package-option--active' : 'card-package-option'}
                  key={tier.quantity}
                  type="button"
                  onClick={() => selectPackage(tier.quantity, tier.imageUrl)}
                >
                  {tier.quantity} шт.
                </button>
              ))}
            </div>
          ) : null}
          <div className="card-package-price">
            <strong>{(unitPrice * packageSize).toLocaleString('ru-RU')} ₽</strong>
            <span>{unitPrice.toLocaleString('ru-RU')} ₽/шт.</span>
            {saving > 0 ? <small>Выгода {saving}%</small> : null}
          </div>
          <div className="card-actions">
            <Link className="card-details-link" to={`/catalog/${candle.slug}`}>Подробнее</Link>
            <button className={isAdded ? 'add-to-cart-button--added' : ''} type="button" onClick={handleAddToCart}>
              {isAdded ? 'Добавлено ✓' : 'В корзину'}
            </button>
          </div>
        </div>
        <span className="cart-feedback" aria-live="polite">
          {isAdded
            ? (candle.priceTiers || []).length > 0
              ? `Коробка на ${packageSize} свечей добавлена`
              : 'Свеча добавлена в корзину'
            : ''}
        </span>
      </div>
    </article>
  );
}
