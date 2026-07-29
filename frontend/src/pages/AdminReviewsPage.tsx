import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  createAdminReview,
  deleteAdminReview,
  getAdminCredentials,
  getReviews,
  setAdminReviewFeatured,
  setAdminReviewImage,
  uploadAdminImage,
  type Review,
} from '../api/adminApi';
import { AdminNav } from '../components/AdminNav';
import { getUploadedImage } from '../utils/images';

export function AdminReviewsPage() {
  const credentials = getAdminCredentials();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState('');
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

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError('');
    try {
      const uploaded = await uploadAdminImage(file);
      setImageUrl(uploaded.url);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить фотографию');
    } finally {
      setIsUploading(false);
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
        imageUrl: imageUrl || undefined,
        featured,
      });
      setReviews((current) => [created, ...current]);
      setDisplayName('');
      setText('');
      setRating(5);
      setImageUrl('');
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

  async function handleReviewImage(review: Review, file: File | undefined) {
    if (!file) return;
    setError('');
    try {
      const uploaded = await uploadAdminImage(file);
      const updated = await setAdminReviewImage(review.id, uploaded.url);
      setReviews((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось заменить фотографию');
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
          <label>Фотография из другой системы
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void handleImageChange(event)} />
            <small>{isUploading ? 'Загружаем…' : 'JPG, PNG или WebP до 5 МБ'}</small>
          </label>
          {imageUrl ? <img className="admin-review-preview" src={getUploadedImage(imageUrl)} alt="Предпросмотр отзыва" /> : null}
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
              {review.photoUrl ? <img src={getUploadedImage(review.photoUrl)} alt="" /> : null}
              <div>
                <span className="stars">{'★'.repeat(review.rating)}</span>
                <strong>{review.name}</strong>
                <p>{review.text}</p>
                <label className="admin-review-image-control">
                  {review.photoUrl ? 'Заменить фотографию' : 'Добавить фотографию'}
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void handleReviewImage(review, event.target.files?.[0])} />
                </label>
              </div>
              <button className={review.featured ? 'admin-featured-button active' : 'admin-featured-button'} type="button" onClick={() => void handleFeatured(review)}>
                {review.featured ? '✓ На главной' : 'Показать на главной'}
              </button>
              <button className="admin-hide-button" type="button" onClick={() => void handleDelete(review.id)}>Удалить</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
