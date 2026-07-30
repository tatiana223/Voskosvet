import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCandleBySlug } from '../api/candlesApi';
import type { Candle } from '../types/candle';
import { addToCart, getCandleSavingPercent, getCandleUnitPrice, getDefaultPackageSize } from '../utils/cart';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { getStoredAuth, subscribeToAuth } from '../utils/auth';
import { getCandleGallery, getCandleImage, useCandleImageFallback } from '../utils/images';

export function CandlePage() {
  const { slug } = useParams();
  const [candle, setCandle] = useState<Candle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [packageSize, setPackageSize] = useState(1);
  const [boxQuantity, setBoxQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [imageIndex, setImageIndex] = useState(0);

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
      setPackageSize(getDefaultPackageSize(candle));
      setImageIndex(0);
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

  const unitPrice = getCandleUnitPrice(candle, packageSize);
  const savingPercent = getCandleSavingPercent(candle, unitPrice);
  const gallery = getCandleGallery(candle);

  function selectPackage(quantity: number, imageUrl?: string) {
    setPackageSize(quantity);
    if (imageUrl) {
      const nextIndex = gallery.indexOf(getCandleImage(imageUrl));
      if (nextIndex >= 0) setImageIndex(nextIndex);
    }
  }

  function showImage(step: number) {
    setImageIndex((current) => (current + step + gallery.length) % gallery.length);
  }

  return (
    <section className="product-page">
      <div className="product-image">
        <img
          src={gallery[imageIndex]}
          alt={candle.name}
          onError={useCandleImageFallback}
        />
        {candle.featured ? <span className="product-featured-badge">Хит продаж</span> : null}
        <span className="product-image-note">Ручная работа</span>
        {gallery.length > 1 ? (
          <>
            <button className="gallery-arrow gallery-arrow--prev" type="button" aria-label="Предыдущее фото" onClick={() => showImage(-1)}>‹</button>
            <button className="gallery-arrow gallery-arrow--next" type="button" aria-label="Следующее фото" onClick={() => showImage(1)}>›</button>
            <span className="gallery-counter product-gallery-counter">{imageIndex + 1}/{gallery.length}</span>
          </>
        ) : null}
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
          {(candle.priceTiers || []).length > 0 ? (
            <div className="quantity-tier-picker">
              <span>Выберите размер коробки</span>
              <div className="quantity-tier-options">
                {candle.priceTiers.map((tier, tierIndex) => {
                  const saving = getCandleSavingPercent(candle, tier.unitPrice);
                  return (
                    <button
                      className={packageSize === tier.quantity ? 'quantity-tier-option quantity-tier-option--active' : 'quantity-tier-option'}
                      type="button"
                      key={tier.quantity}
                      onClick={() => selectPackage(tier.quantity, tier.imageUrl)}
                    >
                      <strong>{tier.quantity} шт. в коробке</strong>
                      <span>{tier.unitPrice.toLocaleString('ru-RU')} ₽/шт.</span>
                      {saving > 0 ? <small>Выгода {saving}%</small> : <small>{tierIndex === 0 ? 'Стандартная коробка' : '\u00a0'}</small>}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className="product-price-row">
            <div className="selected-tier-price">
              <strong>{(unitPrice * packageSize * boxQuantity).toLocaleString('ru-RU')} ₽</strong>
              <span>{unitPrice.toLocaleString('ru-RU')} ₽ за штуку</span>
              {savingPercent > 0 ? <small>Экономия {savingPercent}%</small> : null}
            </div>
            {(candle.priceTiers || []).length === 0 ? (
              <label className="quantity-control">
                Количество
                <input
                  min="1"
                  type="number"
                  value={boxQuantity}
                  onChange={(event) => setBoxQuantity(Math.max(1, Number(event.target.value)))}
                />
              </label>
            ) : (
              <label className="quantity-control">
                Коробок
                <input
                  min="1"
                  type="number"
                  value={boxQuantity}
                  onChange={(event) => setBoxQuantity(Math.max(1, Number(event.target.value)))}
                />
              </label>
            )}
          </div>

          <div className="product-actions">
            <button
              className={`primary-link${isAdded ? ' product-add-button--added' : ''}`}
              type="button"
              disabled={!candle.available}
              onClick={() => {
                addToCart(candle, packageSize, boxQuantity);
                setIsAdded(true);
                window.setTimeout(() => setIsAdded(false), 1800);
              }}
            >
              {isAdded ? 'Добавлено ✓' : 'Добавить в корзину'}
            </button>
            <Link className="secondary-link" to="/cart">Перейти в корзину</Link>
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
