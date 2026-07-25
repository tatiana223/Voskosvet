import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getStoredAuth } from '../utils/auth';

type Review = {
  id: number;
  authorId?: number;
  name: string;
  text: string;
  rating: number;
  photoUrl?: string;
};

const initialReviews: Review[] = [
  {
    id: 1,
    name: 'Полина Ш.',
    text: 'Чистый пчелиный воск, без примесей. Горят ровно, не капают, запах приятный и медовый.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Анастасия',
    text: 'Свечи пришли аккуратно упакованными. Очень красивый тёплый цвет, сразу видно ручную работу.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Екатерина К.',
    text: 'Фитиль ровный, свеча не течёт, горит спокойно и долго. Качеством очень довольна.',
    rating: 5,
  },
];

function getSavedReviews(): Review[] {
  try {
    const savedReviews = localStorage.getItem('voskosvet-reviews');

    return savedReviews ? JSON.parse(savedReviews) : [];
  } catch {
    return [];
  }
}

export function ReviewsPage() {
    const auth = getStoredAuth();

  const [reviews, setReviews] = useState<Review[]>(() => [
    ...getSavedReviews(),
    ...initialReviews,
  ]);


  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoError, setPhotoError] = useState('');

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setPhotoError('');

    if (!file) {
      setPhotoUrl('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setPhotoError('Можно выбрать только изображение.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Фотография должна быть не больше 2 МБ.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhotoUrl(String(reader.result));
    };

    reader.readAsDataURL(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!auth) {
      return;
    }
    const newReview: Review = {
      id: Date.now(),
      authorId: auth.id,
      name: auth.fullName,
      text: text.trim(),
      rating,
      photoUrl: photoUrl || undefined,
    };

    const savedReviews = [newReview, ...getSavedReviews()];

    localStorage.setItem(
      'voskosvet-reviews',
      JSON.stringify(savedReviews),
    );

    setReviews([newReview, ...reviews]);
    setText('');
    setRating(5);
    setPhotoUrl('');
    setMessage('Спасибо! Ваш отзыв опубликован.');
  }

  function handleDeleteReview(reviewId: number) {
    if (!auth) {
      return;
    }

    const review = reviews.find((item) => item.id === reviewId);

    if (!review || review.authorId !== auth.id) {
      return;
    }

    const confirmed = window.confirm('Удалить этот отзыв?');

    if (!confirmed) {
      return;
    }

    const savedReviews = getSavedReviews().filter(
      (item) => item.id !== reviewId,
    );

    localStorage.setItem(
      'voskosvet-reviews',
      JSON.stringify(savedReviews),
    );

    setReviews((currentReviews) =>
      currentReviews.filter((item) => item.id !== reviewId),
    );
  }

  return (
    <section className="reviews-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Отзывы покупателей</p>
          <h1>Что говорят о наших свечах</h1>
        </div>
      </div>

      <div className="reviews-page-layout">
        <div className="reviews-list">
          {reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div
                className="stars"
                aria-label={`${review.rating} из 5`}
              >
                {'★'.repeat(review.rating)}
              </div>

              {review.photoUrl && (
                  <img
                    className="review-photo"
                    src={review.photoUrl}
                    alt={`Фотография от ${review.name}`}
                  />
              )}
              <p>“{review.text}”</p>
              <strong>{review.name}</strong>
              {auth && review.authorId === auth.id && (
                <button
                  className="review-delete-button"
                  type="button"
                  onClick={() => handleDeleteReview(review.id)}
                >
                  Удалить отзыв
                </button>
              )}
            </article>
          ))}
        </div>

        {auth ? (
          <form className="review-form" onSubmit={handleSubmit}>
            <p className="eyebrow">Ваше мнение</p>
            <h2>Оставить отзыв</h2>

            <div className="review-author">
              <span>Отзыв будет опубликован от имени</span>
              <strong>{auth.fullName}</strong>
            </div>

            <label>
              Оценка
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
              >
                <option value={5}>5 — отлично</option>
                <option value={4}>4 — хорошо</option>
                <option value={3}>3 — нормально</option>
                <option value={2}>2 — есть замечания</option>
                <option value={1}>1 — плохо</option>
              </select>
            </label>

            <label>
              Отзыв
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Расскажите о свечах, упаковке или доставке"
                required
                minLength={10}
                maxLength={700}
                rows={6}
              />
            </label>

            <label>
              Фотография
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handlePhotoChange}
              />
            </label>

            {photoUrl && (
              <img
                className="review-photo-preview"
                src={photoUrl}
                alt="Предварительный просмотр"
              />
            )}

            {photoError && (
              <p className="review-photo-error">{photoError}</p>
            )}

            <button className="primary-link" type="submit">
              Опубликовать отзыв
            </button>

            {message && (
              <p className="review-success">{message}</p>
            )}
          </form>
        ) : (
          <div className="review-form review-login-required">
            <p className="eyebrow">Отзывы</p>
            <h2>Войдите в аккаунт</h2>

            <p>
              Оставлять отзывы могут только зарегистрированные пользователи.
            </p>

            <Link className="primary-link" to="/login">
              Войти
            </Link>

            <Link className="secondary-link" to="/register">
              Создать аккаунт
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
