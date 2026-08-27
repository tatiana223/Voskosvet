import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createReview,
  deleteReview,
  getReviews,
  uploadReviewMedia,
  type Review,
  type ReviewMedia,
} from '../api/reviewsApi';
import { getStoredAuth } from '../utils/auth';
import { ReviewMediaGallery } from '../components/ReviewMediaGallery';

export function ReviewsPage() {
  const auth = getStoredAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
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
    if (!auth) return;

    setIsSubmitting(true);
    setMessage('');
    try {
      const created = await createReview({
        text: text.trim(),
        rating,
        media,
      });
      setReviews((current) => [created, ...current]);
      setText('');
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

  async function handleDeleteReview(reviewId: number) {
    if (!auth || !window.confirm('Удалить этот отзыв?')) return;
    await deleteReview(reviewId);
    setReviews((current) => current.filter((review) => review.id !== reviewId));
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
              {auth && review.authorId === auth.id ? (
                <button className="review-delete-button" type="button" onClick={() => void handleDeleteReview(review.id)}>Удалить отзыв</button>
              ) : null}
            </article>
          ))}
        </div>

        {auth ? (
          <form className="review-form" onSubmit={handleSubmit}>
            <p className="eyebrow">Ваше мнение</p>
            <h2>Оставить отзыв</h2>
            <div className="review-author"><span>Отзыв будет опубликован от имени</span><strong>{auth.fullName}</strong></div>
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
        ) : (
          <div className="review-form review-login-required">
            <p className="eyebrow">Отзывы</p><h2>Поделитесь впечатлением</h2>
            <p>Отправьте отзыв администратору магазина — после проверки он появится на этой странице.</p>
          </div>
        )}
      </div>
    </section>
  );
}
