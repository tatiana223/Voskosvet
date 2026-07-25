import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearAdminCredentials,
  createAdminCandle,
  getAdminCandles,
  getAdminCategories,
  getAdminCredentials,
  hideAdminCandle,
  updateAdminCandle,
  type CandleFormData,
} from '../api/adminApi';
import type { Candle } from '../types/candle';
import type { Category } from '../types/category';
import { getCandleImage, useCandleImageFallback } from '../utils/images';
import { AdminNav } from '../components/AdminNav';

const emptyForm: CandleFormData = {
  slug: '',
  name: '',
  description: '',
  shortDescription: '',
  price: 0,
  scent: 'Медовый',
  color: 'Медовый',
  weightGrams: 1,
  burnTimeHours: 1,
  imageUrl: '/images/candle-detail.webp',
  available: true,
  featured: false,
  categoryId: 0,
};

export function AdminCandlesPage() {
  const navigate = useNavigate();
  const [candles, setCandles] = useState<Candle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CandleFormData>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [candlePage, categoryItems] = await Promise.all([
        getAdminCandles(),
        getAdminCategories(),
      ]);
      setCandles(candlePage.items);
      setCategories(categoryItems);
      setForm((current) => ({
        ...current,
        categoryId: current.categoryId || categoryItems[0]?.id || 0,
      }));
    } catch {
      clearAdminCredentials();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!getAdminCredentials()) {
      navigate('/login');
      return;
    }
    void loadData();
  }, []);

  function editCandle(candle: Candle) {
    setEditingId(candle.id);
    setForm({
      slug: candle.slug,
      name: candle.name,
      description: candle.description,
      shortDescription: candle.shortDescription,
      price: candle.price,
      scent: candle.scent,
      color: candle.color,
      weightGrams: candle.weightGrams,
      burnTimeHours: candle.burnTimeHours,
      imageUrl: candle.imageUrl,
      available: candle.available,
      featured: candle.featured,
      categoryId: candle.categoryId,
    });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateField<K extends keyof CandleFormData>(key: K, value: CandleFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingId) {
        await updateAdminCandle(editingId, form);
        setMessage('Свеча обновлена.');
      } else {
        await createAdminCandle(form);
        setMessage('Новая свеча добавлена.');
      }
      setEditingId(null);
      setForm({ ...emptyForm, categoryId: categories[0]?.id || 0 });
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось сохранить свечу');
    }
  }

  async function handleHide(candle: Candle) {
    if (!window.confirm(`Скрыть «${candle.name}» из каталога?`)) return;
    await hideAdminCandle(candle.id);
    await loadData();
  }

  if (loading) return <section className="section"><p className="state-message">Открываем кабинет...</p></section>;

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Управление магазином</p>
          <h1>Свечи и каталог</h1>
        </div>
        <button type="button" onClick={() => {
          clearAdminCredentials();
          navigate('/login');
        }}>Выйти</button>
      </div>
      <div className="admin-shell"><AdminNav /></div>

      <div className="admin-layout">
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Изменить свечу' : 'Добавить свечу'}</h2>

          <div className="admin-form-grid">
            <label>Название<input required value={form.name} onChange={(e) => updateField('name', e.target.value)} /></label>
            <label>Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} /></label>
            <label>Цена, ₽<input required min="1" type="number" value={form.price} onChange={(e) => updateField('price', Number(e.target.value))} /></label>
            <label>Категория<select value={form.categoryId} onChange={(e) => updateField('categoryId', Number(e.target.value))}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label>Аромат<input required value={form.scent} onChange={(e) => updateField('scent', e.target.value)} /></label>
            <label>Цвет<input required value={form.color} onChange={(e) => updateField('color', e.target.value)} /></label>
            <label>Вес, г<input required min="1" type="number" value={form.weightGrams} onChange={(e) => updateField('weightGrams', Number(e.target.value))} /></label>
            <label>Горение, ч<input required min="1" type="number" value={form.burnTimeHours} onChange={(e) => updateField('burnTimeHours', Number(e.target.value))} /></label>
          </div>

          <label>Короткое описание<textarea required rows={2} value={form.shortDescription} onChange={(e) => updateField('shortDescription', e.target.value)} /></label>
          <label>Полное описание<textarea required rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} /></label>
          <label>Ссылка или путь к изображению<input required value={form.imageUrl} onChange={(e) => updateField('imageUrl', e.target.value)} /></label>

          <div className="admin-image-preview">
            <img src={getCandleImage(form.imageUrl)} alt="Предпросмотр свечи" onError={useCandleImageFallback} />
            <span>Предварительный просмотр</span>
          </div>

          <div className="admin-checks">
            <label><input type="checkbox" checked={form.featured} onChange={(e) => updateField('featured', e.target.checked)} /> Хит продаж — показывать на главной</label>
            {editingId ? <label><input type="checkbox" checked={form.available} onChange={(e) => updateField('available', e.target.checked)} /> Показывать в каталоге</label> : null}
          </div>

          {error ? <p className="state-message state-message-error">{error}</p> : null}
          {message ? <p className="admin-success">{message}</p> : null}

          <div className="admin-form-actions">
            <button className="primary-link" type="submit">{editingId ? 'Сохранить изменения' : 'Добавить свечу'}</button>
            {editingId ? <button type="button" onClick={() => {
              setEditingId(null);
              setForm({ ...emptyForm, categoryId: categories[0]?.id || 0 });
            }}>Отмена</button> : null}
          </div>
        </form>

        <div className="admin-products">
          <h2>Свечи в каталоге</h2>
          {candles.map((candle) => (
            <article className="admin-product" key={candle.id}>
              <img src={getCandleImage(candle.imageUrl)} alt={candle.name} onError={useCandleImageFallback} />
              <div><strong>{candle.name}</strong><span>{candle.price.toLocaleString('ru-RU')} ₽ · {candle.categoryName}{candle.featured ? ' · Хит продаж' : ''}</span></div>
              <button type="button" onClick={() => editCandle(candle)}>Изменить</button>
              <button className="admin-hide-button" type="button" onClick={() => void handleHide(candle)}>Скрыть</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
