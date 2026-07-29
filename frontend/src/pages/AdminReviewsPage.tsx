import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  createAdminReview,
  deleteAdminReview,
  getAdminCredentials,
  getReviews,
  setAdminReviewFeatured,
  setAdminReviewCover,
  setAdminReviewMedia,
  type Review,
} from '../api/adminApi';
import { AdminNav } from '../components/AdminNav';
import { ReviewMediaGallery } from '../components/ReviewMediaGallery';
import { uploadReviewMedia, type ReviewMedia } from '../api/reviewsApi';

export function AdminReviewsPage() {
  const credentials = getAdminCredentials();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [media, setMedia] = useState<ReviewMedia[]>([]);
  const [featured, setFeatured] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (credentials) {
      getReviews().then(setReviews).catch((requestError: Error) => setError(requestError.message));
    }
  }, []);

  if (!credentials) return <Navigate to="/login" replace />;
  if (credentials.role !== 'ADMIN') return <Navigate to="/admin" replace />;

  async function handleMediaChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    if (media.length + files.length > 8) {
      setError('К одному отзыву можно прикрепить не больше 8 файлов.');
      return;
    }
    setIsUploading(true);
    setError('');
    try {
      const uploaded = await Promise.all(files.map(uploadReviewMedia));
      setMedia((current) => [...current, ...uploaded]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить файлы');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setMessage('');
    try {
      const created = await createAdminReview({
        displayName,
        text,
        rating,
        media,
        featured,
      });
      setReviews((current) => [created, ...current]);
      setDisplayName('');
      setText('');
      setRating(5);
      setMedia([]);
      setFeatured(false);
      setMessage('Отзыв опубликован на сайте.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось добавить отзыв');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFeatured(review: Review) {
    setError('');
    try {
      const updated = await setAdminReviewFeatured(review.id, !review.featured);
      setReviews((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось изменить показ отзыва');
    }
  }

  async function handleReviewMedia(review: Review, files: File[]) {
    if (files.length === 0) return;
    if (review.media.length + files.length > 8) {
      setError('К одному отзыву можно прикрепить не больше 8 файлов.');
      return;
    }
    setError('');
    try {
      const uploaded = await Promise.all(files.map(uploadReviewMedia));
      const updated = await setAdminReviewMedia(review.id, [...review.media, ...uploaded]);
      setReviews((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось добавить файлы');
    }
  }

  async function removeReviewMedia(review: Review, index: number) {
    setError('');
    try {
      const updated = await setAdminReviewMedia(
        review.id,
        review.media.filter((_, itemIndex) => itemIndex !== index),
      );
      setReviews((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось удалить файл');
    }
  }

  async function makeReviewCover(review: Review, imageUrl: string) {
    setError('');
    try {
      const updated = await setAdminReviewCover(review.id, imageUrl);
      setReviews((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось выбрать обложку');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Удалить этот отзыв с сайта?')) return;
    await deleteAdminReview(id);
    setReviews((current) => current.filter((review) => review.id !== id));
  }

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div><p className="eyebrow">Управление магазином</p><h1>Отзывы</h1></div>
      </div>
      <div className="admin-shell"><AdminNav /></div>

      <div className="admin-reviews-layout">
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>Добавить отзыв</h2>
          <label>Имя автора<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Например, Анна К." /></label>
          <label>Оценка<select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
            <option value={5}>5 — отлично</option><option value={4}>4 — хорошо</option><option value={3}>3 — нормально</option><option value={2}>2 — есть замечания</option><option value={1}>1 — плохо</option>
          </select></label>
          <label>Текст отзыва<textarea required minLength={10} maxLength={1000} rows={6} value={text} onChange={(event) => setText(event.target.value)} /></label>
          <label>Фотографии или видео
            <input type="file" multiple accept="image/png,image/jpeg,image/webp,video/mp4,video/webm" onChange={(event) => void handleMediaChange(event)} />
            <small>{isUploading ? 'Загружаем…' : 'До 8 файлов: фото до 5 МБ, видео до 30 МБ'}</small>
          </label>
          <ReviewMediaGallery media={media} onRemove={(index) => setMedia((current) => current.filter((_, itemIndex) => itemIndex !== index))} />
          <label className="admin-checkbox-row">
            <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
            Показывать этот отзыв на главной странице
          </label>
          {error ? <p className="state-message state-message-error">{error}</p> : null}
          {message ? <p className="admin-success">{message}</p> : null}
          <button className="primary-link" disabled={isSaving || isUploading} type="submit">{isSaving ? 'Публикуем…' : 'Опубликовать отзыв'}</button>
        </form>

        <div className="admin-products">
          <h2>Отзывы на сайте</h2>
          {reviews.map((review) => (
            <article className="admin-review-card" key={review.id}>
              <div className="admin-review-content">
                <span className="stars">{'★'.repeat(review.rating)}</span>
                <strong>{review.name}</strong>
                <p>{review.text}</p>
                <ReviewMediaGallery
                  media={review.media}
                  compact
                  coverUrl={review.photoUrl}
                  onRemove={(index) => void removeReviewMedia(review, index)}
                  onMakeCover={(url) => void makeReviewCover(review, url)}
                />
                <label className="admin-review-image-control">
                  Добавить фото или видео
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
                    onChange={(event) => {
                      void handleReviewMedia(review, Array.from(event.target.files || []));
                      event.target.value = '';
                    }}
                  />
                </label>
              </div>
              <div className="admin-review-actions">
                <button className={review.featured ? 'admin-featured-button active' : 'admin-featured-button'} type="button" onClick={() => void handleFeatured(review)}>
                  {review.featured ? '✓ На главной' : 'На главную'}
                </button>
                <button className="admin-hide-button" type="button" onClick={() => void handleDelete(review.id)}>Удалить отзыв</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
