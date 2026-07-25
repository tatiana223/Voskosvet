import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CandleCard } from '../components/CandleCard';
import type { Candle } from '../types/candle';
import { getFavorites, subscribeToFavorites } from '../utils/favorites';
import { getStoredAuth } from '../utils/auth';

export function FavoritesPage() {
  const auth = getStoredAuth();
  const [favorites, setFavorites] = useState<Candle[]>(getFavorites);

  useEffect(() => {
    return subscribeToFavorites(() => setFavorites(getFavorites()));
  }, []);

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="section favorites-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Ваш выбор</p>
          <h1>Избранные свечи</h1>
        </div>
        {favorites.length > 0 ? <span>{favorites.length} шт.</span> : null}
      </div>

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <span className="favorites-empty__heart" aria-hidden="true">♡</span>
          <h2>Здесь пока ничего нет</h2>
          <p>Нажимайте на сердечко у понравившихся свечей, чтобы сохранить их здесь.</p>
          <Link className="primary-link" to="/catalog">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="grid">
          {favorites.map((candle, index) => (
            <CandleCard key={candle.id} candle={candle} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
