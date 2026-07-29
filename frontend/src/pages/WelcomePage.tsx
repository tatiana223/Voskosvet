import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCandles } from '../api/candlesApi';
import { CandleCard } from '../components/CandleCard';
import type { Candle } from '../types/candle';
import { getSiteContent } from '../api/contentApi';
import { defaultSiteContent, type SiteContent } from '../types/siteContent';
import { updateAdminContent, uploadAdminImage } from '../api/adminApi';
import { InlineImageEditor, InlineTextEditor } from '../components/InlineContentEditor';
import { getReviews, type Review } from '../api/reviewsApi';
import { getUploadedImage } from '../utils/images';

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
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);

  useEffect(() => {
    getSiteContent().then(setContent).catch(() => undefined);
    getReviews()
      .then((items) => setFeaturedReviews(items.filter((review) => review.featured).slice(0, 3)))
      .catch(() => setFeaturedReviews([]));
  }, []);

  async function saveField(key: keyof SiteContent, value: string) {
    const saved = await updateAdminContent({ [key]: value });
    setContent((current) => ({ ...current, ...saved }));
  }

  async function uploadField(key: keyof SiteContent, file: File) {
    const uploaded = await uploadAdminImage(file);
    await saveField(key, uploaded.url);
  }

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
          <InlineTextEditor as="h1" value={content['home.heroTitle']} label="Главный заголовок" onSave={(value) => saveField('home.heroTitle', value)} />
          <InlineTextEditor as="p" value={content['home.heroSubtitle']} label="Описание под заголовком" multiline onSave={(value) => saveField('home.heroSubtitle', value)} />

          <div className="hero-points">
            <span>
              <Emblem name="leaf" />
              <InlineTextEditor as="b" value={content['home.point1']} label="Первое преимущество" onSave={(value) => saveField('home.point1', value)} />
            </span>
            <span>
              <Emblem name="flame" />
              <InlineTextEditor as="b" value={content['home.point2']} label="Второе преимущество" onSave={(value) => saveField('home.point2', value)} />
            </span>
            <span>
              <Emblem name="gift" />
              <InlineTextEditor as="b" value={content['home.point3']} label="Третье преимущество" onSave={(value) => saveField('home.point3', value)} />
            </span>
          </div>

          <Link className="primary-link" to="/catalog">
            {content['home.heroButton']}
          </Link>
        </div>

        <InlineImageEditor
          className="hero-photo hero-photo-custom"
          background
          value={content['home.heroImage']}
          label="Главное изображение"
          onUpload={(file) => uploadField('home.heroImage', file)}
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
          <InlineTextEditor as="p" className="eyebrow" value={content['home.aboutEyebrow']} label="Надпись над разделом" onSave={(value) => saveField('home.aboutEyebrow', value)} />
          <InlineTextEditor as="h2" value={content['home.aboutTitle']} label="Заголовок раздела" onSave={(value) => saveField('home.aboutTitle', value)} />
          <InlineTextEditor as="p" value={content['home.aboutText']} label="Текст раздела" multiline onSave={(value) => saveField('home.aboutText', value)} />
        </div>

        <div className="why-grid">
          <div>
            <InlineImageEditor value={content['home.aboutImage1']} label="Первое изображение" onUpload={(file) => uploadField('home.aboutImage1', file)} />
            <InlineTextEditor as="span" value={content['home.aboutCaption1']} label="Подпись первого изображения" onSave={(value) => saveField('home.aboutCaption1', value)} />
          </div>
          <div>
            <InlineImageEditor value={content['home.aboutImage2']} label="Второе изображение" onUpload={(file) => uploadField('home.aboutImage2', file)} />
            <InlineTextEditor as="span" value={content['home.aboutCaption2']} label="Подпись второго изображения" onSave={(value) => saveField('home.aboutCaption2', value)} />
          </div>
          <div>
            <InlineImageEditor value={content['home.aboutImage3']} label="Третье изображение" onUpload={(file) => uploadField('home.aboutImage3', file)} />
            <InlineTextEditor as="span" value={content['home.aboutCaption3']} label="Подпись третьего изображения" onSave={(value) => saveField('home.aboutCaption3', value)} />
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
          {featuredReviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="stars" aria-label={`${review.rating} из 5`}>
                {'★'.repeat(review.rating)}
              </div>
              {review.photoUrl ? (
                <div className="review-home-cover">
                  <img className="media-backdrop" src={getUploadedImage(review.photoUrl)} alt="" aria-hidden="true" />
                  <img className="media-foreground" src={getUploadedImage(review.photoUrl)} alt={`Фотография к отзыву ${review.name}`} />
                </div>
              ) : null}
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

      </section>

    </div>
  );
}
