import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCandles } from '../api/candlesApi';
import { CandleCard } from '../components/CandleCard';
import type { Candle } from '../types/candle';
import { getSiteContent } from '../api/contentApi';
import { defaultSiteContent, type SiteContent } from '../types/siteContent';
import { getUploadedImage } from '../utils/images';

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
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);

  useEffect(() => {
    getSiteContent().then(setContent).catch(() => undefined);
  }, []);

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
      <section className="hero screen-section hero-custom-background" id="home">
        <div className="hero-copy">
          <h1>{content['home.heroTitle']}</h1>
          <p>{content['home.heroSubtitle']}</p>

          <div className="hero-points">
            <span>
              <Emblem name="leaf" />
              <b>{content['home.point1']}</b>
            </span>
            <span>
              <Emblem name="flame" />
              <b>{content['home.point2']}</b>
            </span>
            <span>
              <Emblem name="gift" />
              <b>{content['home.point3']}</b>
            </span>
          </div>

          <Link className="primary-link" to="/catalog">
            {content['home.heroButton']}
          </Link>
        </div>

        <div
          className="hero-photo hero-photo-custom"
          style={{ backgroundImage: `url("${getUploadedImage(content['home.heroImage'])}")` }}
          aria-hidden="true"
        />

        <section className="benefit-ribbon" aria-label="Преимущества">
          <div>
            <Emblem name="honey" />
            <span>Естественный<br />медовый аромат</span>
          </div>
          <div>
            <Emblem name="flame" />
            <span>Горят ровно<br />Около 1 часа</span>
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

      </section>

      <section className="why-section screen-section" id="about">
        <div className="why-copy">
          <p className="eyebrow">{content['home.aboutEyebrow']}</p>
          <h2>{content['home.aboutTitle']}</h2>
          <p>{content['home.aboutText']}</p>
        </div>

        <div className="why-grid">
          <div>
            <img src={getUploadedImage(content['home.aboutImage1'])} alt="" />
            <span>{content['home.aboutCaption1']}</span>
          </div>
          <div>
            <img src={getUploadedImage(content['home.aboutImage2'])} alt="" />
            <span>{content['home.aboutCaption2']}</span>
          </div>
          <div>
            <img src={getUploadedImage(content['home.aboutImage3'])} alt="" />
            <span>{content['home.aboutCaption3']}</span>
          </div>
        </div>

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
          <img src="/images/candle-detail.webp" alt="Восковая свеча на льняной ткани" />
          <img src="/images/gift-box.webp" alt="Подарочная коробка свечей" />
          <img src="/images/about-natural-candle.webp" alt="Горящая свеча на деревянном столе" />
        </div>

      </section>

    </div>
  );
}
