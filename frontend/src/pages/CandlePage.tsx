import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCandleBySlug } from '../api/candlesApi';
import type { Candle } from '../types/candle';
import { addToCart } from '../utils/cart';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { getStoredAuth, subscribeToAuth } from '../utils/auth';
import { getCandleImage, useCandleImageFallback } from '../utils/images';

export function CandlePage() {
  const { slug } = useParams();
  const [candle, setCandle] = useState<Candle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [auth, setAuth] = useState(() => getStoredAuth());

  useEffect(() => {
    if (!slug) {
      return;
    }

    getCandleBySlug(slug)
      .then(setCandle)
      .finally(() => setIsLoading(false));
  }, [slug]);

  useEffect(() => {
    if (candle) {
      setFavorite(isFavorite(candle.id));
    }
  }, [candle]);

  useEffect(() => {
    return subscribeToAuth(() => {
      setAuth(getStoredAuth());
      setFavorite(candle ? isFavorite(candle.id) : false);
    });
  }, [candle]);

  if (isLoading) {
    return <section className="section">Загружаем свечу...</section>;
  }

  if (!candle) {
    return <section className="section">Свеча не найдена</section>;
  }

  return (
    <section className="product-page">
      <div className="product-image">
        <img
          src={getCandleImage(candle.imageUrl)}
          alt={candle.name}
          onError={useCandleImageFallback}
        />
        {candle.featured ? <span className="product-featured-badge">Хит продаж</span> : null}
        <span className="product-image-note">Ручная работа</span>
      </div>

      <div className="product-info">
        <Link className="product-back-link" to="/catalog">← Вернуться в каталог</Link>
        <div className="product-meta">
          <p className="eyebrow">{candle.categoryName}</p>
          <span className={candle.available ? 'product-available' : 'product-unavailable'}>
            {candle.available ? 'В наличии' : 'Нет в наличии'}
          </span>
        </div>
        <h1>{candle.name}</h1>
        <p className="product-lead">{candle.shortDescription || candle.description}</p>
        {candle.description !== candle.shortDescription ? (
          <p className="product-description">{candle.description}</p>
        ) : null}

        <dl className="specs">
          <div>
            <dt>Аромат</dt>
            <dd>{candle.scent}</dd>
          </div>
          <div>
            <dt>Цвет</dt>
            <dd>{candle.color}</dd>
          </div>
          {candle.size ? (
            <div>
              <dt>Размер</dt>
              <dd>{candle.size}</dd>
            </div>
          ) : null}
          <div>
            <dt>Вес</dt>
            <dd>{candle.weightGrams} г</dd>
          </div>
          <div>
            <dt>Горение</dt>
            <dd>{candle.burnTimeHours} ч</dd>
          </div>
        </dl>

        <div className="product-purchase">
          <div className="product-price-row">
            <strong>{candle.price.toLocaleString('ru-RU')} ₽</strong>
            <label className="quantity-control">
              Количество
              <input
                min="1"
                type="number"
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
              />
            </label>
          </div>

          <div className="product-actions">
            {auth ? (
              <>
                <button
                  className={`primary-link${isAdded ? ' product-add-button--added' : ''}`}
                  type="button"
                  disabled={!candle.available}
                  onClick={() => {
                    addToCart(candle, quantity);
                    setIsAdded(true);
                    window.setTimeout(() => setIsAdded(false), 1800);
                  }}
                >
                  {isAdded ? 'Добавлено ✓' : 'Добавить в корзину'}
                </button>
                <Link className="secondary-link" to="/cart">Перейти в корзину</Link>
              </>
            ) : (
              <Link className="primary-link" to="/login">Войти, чтобы купить</Link>
            )}
            {auth ? (
              <button
                className={`product-favorite-button${favorite ? ' product-favorite-button--active' : ''}`}
                type="button"
                aria-pressed={favorite}
                onClick={() => setFavorite(toggleFavorite(candle))}
              >
                {favorite ? '♥ В избранном' : '♡ В избранное'}
              </button>
            ) : null}
          </div>

          {isAdded ? (
            <p className="product-cart-feedback" role="status">
              Готово! Свечи добавлены в корзину.
            </p>
          ) : null}
        </div>

        <div className="product-assurance">
          <span>100% натуральный воск</span>
          <span>Бережная упаковка</span>
          <span>Доставка по России</span>
        </div>
      </div>
    </section>
  );
}
