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
import { getCandleImage, useCandleImageFallback } from '../utils/images';

type CandleCardProps = {
  candle: Candle;
  index?: number;
};

export function CandleCard({ candle }: CandleCardProps) {
  const image = getCandleImage(candle.imageUrl);
  const [favorite, setFavorite] = useState(() => isFavorite(candle.id));
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [packageSize, setPackageSize] = useState(() => getDefaultPackageSize(candle));
  const [isAdded, setIsAdded] = useState(false);
  const unitPrice = getCandleUnitPrice(candle, packageSize);
  const saving = getCandleSavingPercent(candle, unitPrice);

  useEffect(() => {
    return subscribeToAuth(() => {
      setAuth(getStoredAuth());
      setFavorite(isFavorite(candle.id));
    });
  }, [candle.id]);

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
      <Link className="candle-image" to={`/catalog/${candle.slug}`}>
        <img src={image} alt={candle.name} onError={useCandleImageFallback} />
        {candle.featured ? <span className="featured-badge">Хит продаж</span> : null}
      </Link>

      <div className="candle-card-body">
        <h3>{candle.name}</h3>
        <p>{candle.shortDescription || '100% пчелиный воск'}</p>
        {(candle.priceTiers || []).length > 0 ? (
          <div className="card-package-picker" aria-label="Размер коробки">
            {candle.priceTiers.map((tier) => (
              <button
                className={packageSize === tier.quantity ? 'card-package-option card-package-option--active' : 'card-package-option'}
                key={tier.quantity}
                type="button"
                onClick={() => setPackageSize(tier.quantity)}
              >
                {tier.quantity} шт.
              </button>
            ))}
          </div>
        ) : (
          <div className="card-single-purchase">
            <span>Поштучно</span>
            <small>Можно выбрать любое количество</small>
          </div>
        )}
        <div className="card-footer">
          <div className="card-package-price">
            <strong>{(unitPrice * packageSize).toLocaleString('ru-RU')} ₽</strong>
            <span>{unitPrice.toLocaleString('ru-RU')} ₽/шт.</span>
            {saving > 0 ? <small>Выгода {saving}%</small> : null}
          </div>
          <div className="card-actions">
            <Link className="card-details-link" to={`/catalog/${candle.slug}`}>Подробнее</Link>
            <button
              className={isAdded ? 'add-to-cart-button--added' : ''}
              type="button"
              onClick={handleAddToCart}
            >
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
