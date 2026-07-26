import { useEffect, useState } from 'react';
import { getCandles } from '../api/candlesApi';
import { getCategories } from '../api/categoriesApi';
import { CandleCard } from '../components/CandleCard';
import type { Candle } from '../types/candle';
import type { Category } from '../types/category';

export function CatalogPage() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [candleSize, setCandleSize] = useState('');
  const [debouncedCandleSize, setDebouncedCandleSize] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('createdAt,desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedCandleSize(candleSize.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [candleSize]);

  useEffect(() => {
    setIsLoading(true);
    setError('');
    getCandles({
      candleSize: debouncedCandleSize || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
      size: 12,
    })
      .then((page) => setCandles(page.items))
      .catch(() => {
        setCandles([]);
        setError('Каталог не загрузился. Проверь, что backend запущен на http://localhost:8080.');
      })
      .finally(() => setIsLoading(false));
  }, [debouncedCandleSize, categoryId, minPrice, maxPrice, sort]);

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Каталог</p>
          <h1>Коллекция света</h1>
        </div>

        <div className="catalog-actions">
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="createdAt,desc">Сначала новые</option>
            <option value="price,asc">Сначала дешевле</option>
            <option value="price,desc">Сначала дороже</option>
          </select>
        </div>
      </div>

      <div className="filter-panel">
        <div className="filter-grid">
          <label>
            Размер свечи
            <input
              type="search"
              value={candleSize}
              onChange={(event) => setCandleSize(event.target.value)}
              placeholder="Например, 15 см"
            />
          </label>

          <label>
            Категория
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Цена от
            <input
              min="0"
              type="number"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="0"
            />
          </label>

          <label>
            Цена до
            <input
              min="0"
              type="number"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="2000"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              setCandleSize('');
              setCategoryId('');
              setMinPrice('');
              setMaxPrice('');
              setSort('createdAt,desc');
            }}
          >
            Сбросить
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="state-message">Собираем каталог...</p>
      ) : error ? (
        <p className="state-message state-message-error">{error}</p>
      ) : candles.length === 0 ? (
        <p className="state-message">В этой подборке пока нет свечей.</p>
      ) : (
        <div className="grid">
          {candles.map((candle) => (
            <CandleCard key={candle.id} candle={candle} />
          ))}
        </div>
      )}
    </section>
  );
}
