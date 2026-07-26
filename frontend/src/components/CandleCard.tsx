import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Candle } from '../types/candle';
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

  useEffect(() => {
    return subscribeToAuth(() => {
      setAuth(getStoredAuth());
      setFavorite(isFavorite(candle.id));
    });
  }, [candle.id]);

  return (
    <article className="candle-card">
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
          </div>
        </div>
      </div>
    </article>
  );
}
