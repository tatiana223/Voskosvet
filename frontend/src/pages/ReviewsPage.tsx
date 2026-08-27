import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createReview,
  getReviews,
  uploadReviewMedia,
  type Review,
  type ReviewMedia,
} from '../api/reviewsApi';
import { ReviewMediaGallery } from '../components/ReviewMediaGallery';

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [media, setMedia] = useState<ReviewMedia[]>([]);
  const [message, setMessage] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    getReviews()
      .then(setReviews)
      .catch(() => setPhotoError('Не удалось загрузить отзывы.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const created = await createReview({
        displayName: displayName.trim(),
        text: text.trim(),
        rating,
        media,
      });
      setReviews((current) => [created, ...current]);
      setText('');
      setDisplayName('');
      setRating(5);
      setMedia([]);
      setMessage('Спасибо! Ваш отзыв опубликован.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMediaChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    if (media.length + files.length > 8) {
      setPhotoError('К одному отзыву можно прикрепить не больше 8 файлов.');
      return;
    }
    setIsUploading(true);
    setPhotoError('');
    try {
      const uploaded = await Promise.all(files.map(uploadReviewMedia));
      setMedia((current) => [...current, ...uploaded]);
    } catch (requestError) {
      setPhotoError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить файлы');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  return (
    <section className="reviews-page">
      <div className="section-heading">
        <div><p className="eyebrow">Отзывы покупателей</p><h1>Что говорят о наших свечах</h1></div>
      </div>

      <div className="reviews-page-layout">
        <div className="reviews-list">
          {isLoading ? <p className="state-message">Загружаем отзывы…</p> : null}
          {reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="stars" aria-label={`${review.rating} из 5`}>{'★'.repeat(review.rating)}</div>
              <ReviewMediaGallery media={review.media} />
              <p>“{review.text}”</p>
              <strong>{review.name}</strong>
            </article>
          ))}
        </div>

        <form className="review-form" onSubmit={handleSubmit}>
            <p className="eyebrow">Ваше мнение</p>
            <h2>Оставить отзыв</h2>
            <label>Ваше имя<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required minLength={2} maxLength={100} placeholder="Как вас представить" /></label>
            <label>Оценка<select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
              <option value={5}>5 — отлично</option><option value={4}>4 — хорошо</option><option value={3}>3 — нормально</option><option value={2}>2 — есть замечания</option><option value={1}>1 — плохо</option>
            </select></label>
            <label>Отзыв<textarea value={text} onChange={(event) => setText(event.target.value)} required minLength={10} maxLength={1000} rows={6} /></label>
            <label>
              Фотографии или видео к отзыву
              <input type="file" multiple accept="image/png,image/jpeg,image/webp,video/mp4,video/webm" onChange={(event) => void handleMediaChange(event)} />
              <small>{isUploading ? 'Загружаем файлы…' : 'До 8 файлов: фото до 5 МБ, видео MP4/WebM до 30 МБ'}</small>
            </label>
            <ReviewMediaGallery media={media} onRemove={(index) => setMedia((current) => current.filter((_, itemIndex) => itemIndex !== index))} />
            {photoError ? <p className="review-photo-error">{photoError}</p> : null}
            <button className="primary-link" disabled={isSubmitting || isUploading} type="submit">{isSubmitting ? 'Публикуем…' : 'Опубликовать отзыв'}</button>
            {message ? <p className="review-success">{message}</p> : null}
        </form>
      </div>
    </section>
  );
}
