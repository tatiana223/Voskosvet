import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCandles } from '../api/candlesApi';
import { CandleCard } from '../components/CandleCard';
import type { Candle } from '../types/candle';

const reviews = [
  {
    name: 'Полина Ш.',
    text: 'Чистый пчелиный воск, без примесей. Горят ровно, не капают, копоти совсем нет. Запах приятный, медовый.',
  },
  {
    name: 'Анастасия',
    text: 'Свечи пришли аккуратно упакованные. Очень красивый теплый цвет, сразу видно ручную работу.',
  },
  {
    name: 'Екатерина К.',
    text: 'Понравилось качество: фитиль ровный, свеча не течет, горит спокойно и долго.',
  },
];

type EmblemName = 'leaf' | 'flame' | 'gift' | 'honey';

function Emblem({ name }: { name: EmblemName }) {
  if (name === 'flame') {
    return (
      <i className="emblem" aria-hidden="true">
        <svg viewBox="0 0 40 40">
          <path d="M20 33c6 0 10-4.2 10-10.2 0-4.8-2.8-8.6-6.8-12.8-.5 4.5-3.4 6.6-6.1 9.4-1.8-2.2-2.3-4.4-1.8-7.1C11.8 15.5 10 19 10 23c0 5.8 4.1 10 10 10Z" />
          <path d="M20 32c2.9 0 5-2.1 5-5 0-2.4-1.5-4.5-3.5-6.8-.5 2.4-2.1 3.8-3.7 5.4-.8-1-1.1-2.1-.9-3.5-1.7 1.7-2.6 3.5-2.6 5.3 0 2.7 2.4 4.6 5.7 4.6Z" />
        </svg>
      </i>
    );
  }

  if (name === 'gift') {
    return (
      <i className="emblem" aria-hidden="true">
        <svg viewBox="0 0 40 40">
          <path d="M8 17h24v16H8V17Z" />
          <path d="M6 12h28v6H6v-6Z" />
          <path d="M20 12v21" />
          <path d="M20 12c-4.4-6.8-10.8-3.2-7.2 0H20Z" />
          <path d="M20 12c4.4-6.8 10.8-3.2 7.2 0H20Z" />
        </svg>
      </i>
    );
  }

  if (name === 'honey') {
    return (
      <i className="emblem" aria-hidden="true">
        <svg viewBox="0 0 40 40">
          <path d="M15 7h10l5 8-5 8H15l-5-8 5-8Z" />
          <path d="M25 7h7l4 7-4 7h-7" />
          <path d="M15 23h10l5 8-5 8H15l-5-8 5-8Z" />
          <path d="M5 15h5" />
          <path d="M30 31h5" />
        </svg>
      </i>
    );
  }

  return (
    <i className="emblem" aria-hidden="true">
      <svg viewBox="0 0 40 40">
        <path d="M8 28c12.2 1 20.3-5.7 24-20-14.3 3.7-21 11.8-20 24" />
        <path d="M12 28 30 10" />
        <path d="M18 22c-4.7-4.8-8.8-6.1-13-4 2.1 5.5 6 8.7 12 9.6" />
      </svg>
    </i>
  );
}

export function WelcomePage() {
  const [popularCandles, setPopularCandles] = useState<Candle[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);

  useEffect(() => {
    getCandles({
      featured: true,
      size: 4,
      sort: 'createdAt,desc',
    })
      .then((page) => setPopularCandles(page.items.slice(0, 4)))
      .catch(() => setPopularCandles([]))
      .finally(() => setPopularLoading(false));
  }, []);

  return (
    <div className="landing-snap">
      <section className="hero screen-section" id="home">
        <div className="hero-copy">
          <h1>Натуральные церковные свечи из пчелиного воска</h1>
          <p>
            Чистый воск. Медовый аромат. Ровное горение.
          </p>

          <div className="hero-points">
            <span>
              <Emblem name="leaf" />
              <b>100% пчелиный воск</b>
            </span>
            <span>
              <Emblem name="flame" />
              <b>Не коптят и не текут</b>
            </span>
            <span>
              <Emblem name="gift" />
              <b>Упаковано с любовью</b>
            </span>
          </div>

          <Link className="primary-link" to="/catalog">
            Смотреть каталог
          </Link>
        </div>

        <div className="hero-photo" aria-hidden="true" />

        <a className="section-next section-next--hero" href="#catalog-preview">
          <span>Дальше</span>
          <i aria-hidden="true">↓</i>
        </a>

        <section className="benefit-ribbon" aria-label="Преимущества">
          <div>
            <Emblem name="honey" />
            <span>Естественный<br />медовый аромат</span>
          </div>
          <div>
            <Emblem name="flame" />
            <span>Горят ровно<br />около 1 часа</span>
          </div>
          <div>
            <Emblem name="leaf" />
            <span>Без парафина<br />и примесей</span>
          </div>
          <div>
            <Emblem name="gift" />
            <span>Идеально<br />для подарка</span>
          </div>
        </section>
      </section>

      <section className="home-section screen-section" id="catalog-preview">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Каталог</p>
            <h2>Хиты продаж</h2>
          </div>
          <Link to="/catalog">Смотреть все</Link>
        </div>

        {popularLoading ? (
          <p className="state-message">Загружаем хиты продаж...</p>
        ) : popularCandles.length === 0 ? (
          <div className="home-featured-empty">
            <p>Администратор пока не выбрал хиты продаж.</p>
            <Link className="primary-link" to="/catalog">Перейти в каталог</Link>
          </div>
        ) : (
          <div className="grid products-grid">
            {popularCandles.map((candle, index) => (
              <CandleCard key={candle.id} candle={candle} index={index} />
            ))}
          </div>
        )}

        <a className="section-next" href="#about">
          <span>Дальше</span>
          <i aria-hidden="true">↓</i>
        </a>
      </section>

      <section className="why-section screen-section" id="about">
        <div className="why-copy">
          <p className="eyebrow">О мастерской</p>
          <h2>Почему выбирают ВоскоСвет</h2>
          <p>
            Мы делаем свечи из натурального пчелиного воска, выбираем спокойную
            упаковку и теплые материалы: дерево, лен, бумагу и медовые оттенки.
          </p>
        </div>

        <div className="why-grid">
          <div>
            <img src="/images/candle-size.png" alt="Размер восковой свечи" />
            <span>15 см<br />удобный формат</span>
          </div>
          <div>
            <img src="/images/candle-detail.png" alt="Деталь восковой свечи" />
            <span>Медовый цвет<br />и гладкий воск</span>
          </div>
          <div>
            <img src="/images/gift-box.png" alt="Коробка со свечами" />
            <span>Красивая упаковка<br />для подарка</span>
          </div>
        </div>

        <a className="section-next" href="#reviews">
          <span>Дальше</span>
          <i aria-hidden="true">↓</i>
        </a>
      </section>

      <section className="review-section screen-section" id="reviews">
        <div className="section-heading centered">
          <div>
            <p className="eyebrow">Отзывы</p>
            <h2>Что говорят наши покупатели</h2>
          </div>
        </div>

        <div className="reviews-grid">
          {reviews.map((review) => (
            <article className="review-card" key={review.name}>
              <div className="stars" aria-label="5 из 5">
                ★★★★★
              </div>
              <p>“{review.text}”</p>
              <strong>{review.name}</strong>
            </article>
          ))}
        </div>

        <div className="reviews-all-link">
          <Link className="primary-link" to="/reviews">
            Смотреть все отзывы
          </Link>
        </div>

        <div className="review-photo-strip">
          <img src="/images/candle-detail.png" alt="Восковая свеча на льняной ткани" />
          <img src="/images/gift-box.png" alt="Подарочная коробка свечей" />
          <img src="/images/about-natural-candle.png" alt="Горящая свеча на деревянном столе" />
        </div>

        <a className="section-next section-next--up" href="#home">
          <span>Наверх</span>
          <i aria-hidden="true">↑</i>
        </a>
      </section>

    </div>
  );
}
