import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Candle } from '../types/candle';
import { addToCart } from '../utils/cart';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { getStoredAuth, subscribeToAuth } from '../utils/auth';
import { getCandleImage, useCandleImageFallback } from '../utils/images';

type CandleCardProps = {
  candle: Candle;
  index?: number;
};

export function CandleCard({ candle }: CandleCardProps) {
  const image = getCandleImage(candle.imageUrl);
  const [isAdded, setIsAdded] = useState(false);
  const [favorite, setFavorite] = useState(() => isFavorite(candle.id));
  const [auth, setAuth] = useState(() => getStoredAuth());

  useEffect(() => {
    return subscribeToAuth(() => {
      setAuth(getStoredAuth());
      setFavorite(isFavorite(candle.id));
    });
  }, [candle.id]);

  function handleAddToCart() {
    addToCart(candle);
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
        <div className="card-footer">
          <strong>{candle.price.toLocaleString('ru-RU')} ₽</strong>
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
          {isAdded ? 'Свеча уже в корзине' : ''}
        </span>
      </div>
    </article>
  );
}
