import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCandles } from '../api/candlesApi';
import { CandleCard } from '../components/CandleCard';
import type { Candle } from '../types/candle';

export function HomePage() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCandles({ featured: true, size: 4, sort: 'createdAt,desc' })
      .then((page) => {
        if (page.items.length > 0) {
          setCandles(page.items);
          return;
        }

        return getCandles({ size: 4, sort: 'createdAt,desc' }).then((fallbackPage) => {
          setCandles(fallbackPage.items);
        });
      })
      .catch(() => setError('Backend не отвечает. Запусти Java-приложение на http://localhost:8080.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <section className="hero-section">
        <div>
          <p className="eyebrow">Ателье свечей ручной работы</p>
          <h1>Маленькая магия света для дома, подарков и тихих вечеров</h1>
          <p>
            Ароматические и интерьерные свечи с мягким сиянием, глубокими ароматами
            и ощущением, будто вечер наконец-то стал твоим.
          </p>
          <Link className="primary-link" to="/catalog">
            Перейти в каталог
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Свечи с особым настроением</h2>
          <Link to="/catalog">Все свечи</Link>
        </div>

        {isLoading ? (
          <p className="state-message">Зажигаем витрину...</p>
        ) : error ? (
          <p className="state-message state-message-error">{error}</p>
        ) : candles.length === 0 ? (
          <p className="state-message">Пока нет свечей для показа.</p>
        ) : (
          <div className="grid">
            {candles.map((candle) => (
              <CandleCard key={candle.id} candle={candle} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
