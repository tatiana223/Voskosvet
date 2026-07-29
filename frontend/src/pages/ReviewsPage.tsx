import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  createReview,
  deleteReview,
  getReviews,
  uploadReviewImage,
  type Review,
} from '../api/reviewsApi';
import { getStoredAuth } from '../utils/auth';
import { getUploadedImage } from '../utils/images';

export function ReviewsPage() {
  const auth = getStoredAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState('');
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
        imageUrl: imageUrl || undefined,
      });
      setReviews((current) => [created, ...current]);
      setText('');
      setRating(5);
      setImageUrl('');
      setMessage('Спасибо! Ваш отзыв опубликован.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setPhotoError('');
    try {
      const uploaded = await uploadReviewImage(file);
      setImageUrl(uploaded.url);
    } catch (requestError) {
      setPhotoError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить фотографию');
    } finally {
      setIsUploading(false);
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
              {review.photoUrl ? (
                <img className="review-photo" src={getUploadedImage(review.photoUrl)} alt={`Фотография от ${review.name}`} />
              ) : null}
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
              Фотография к отзыву
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void handleImageChange(event)} />
              <small>{isUploading ? 'Загружаем фотографию…' : 'Необязательно. JPG, PNG или WebP до 5 МБ'}</small>
            </label>
            {imageUrl ? <img className="review-photo-preview" src={getUploadedImage(imageUrl)} alt="Предпросмотр фотографии" /> : null}
            {photoError ? <p className="review-photo-error">{photoError}</p> : null}
            <button className="primary-link" disabled={isSubmitting || isUploading} type="submit">{isSubmitting ? 'Публикуем…' : 'Опубликовать отзыв'}</button>
            {message ? <p className="review-success">{message}</p> : null}
          </form>
        ) : (
          <div className="review-form review-login-required">
            <p className="eyebrow">Отзывы</p><h2>Войдите в аккаунт</h2>
            <p>Оставлять отзывы могут только зарегистрированные пользователи.</p>
            <Link className="primary-link" to="/login">Войти</Link>
            <Link className="secondary-link" to="/register">Создать аккаунт</Link>
          </div>
        )}
      </div>
    </section>
  );
}
