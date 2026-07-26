import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearAdminCredentials,
  createAdminCandleSize,
  createAdminCandle,
  getAdminCandles,
  getAdminCategories,
  getAdminCredentials,
  hideAdminCandle,
  updateAdminCandle,
  AdminApiError,
  uploadAdminImage,
  type CandleFormData,
} from '../api/adminApi';
import { getCandleSizes, type CandleSizeOption } from '../api/candleSizesApi';
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
  size: '',
  weightGrams: 1,
  burnTimeHours: 1,
  imageUrl: '/images/candle-detail.webp',
  available: true,
  featured: false,
  categoryId: 0,
  priceTiers: [],
};

export function AdminCandlesPage() {
  const navigate = useNavigate();
  const [candles, setCandles] = useState<Candle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<CandleSizeOption[]>([]);
  const [newSize, setNewSize] = useState('');
  const [form, setForm] = useState<CandleFormData>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isImageUploading, setIsImageUploading] = useState(false);

  async function loadData() {
    try {
      const [candlePage, categoryItems, sizeItems] = await Promise.all([
        getAdminCandles(),
        getAdminCategories(),
        getCandleSizes(),
      ]);
      setCandles(candlePage.items);
      setCategories(categoryItems);
      setSizes(sizeItems);
      setForm((current) => ({
        ...current,
        categoryId: current.categoryId || categoryItems[0]?.id || 0,
      }));
    } catch (requestError) {
      if (requestError instanceof AdminApiError && requestError.status === 401) {
        clearAdminCredentials();
        navigate('/login');
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Не удалось загрузить данные магазина',
        );
      }
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
      size: candle.size || '',
      weightGrams: candle.weightGrams,
      burnTimeHours: candle.burnTimeHours,
      imageUrl: candle.imageUrl,
      available: candle.available,
      featured: candle.featured,
      categoryId: candle.categoryId,
      priceTiers: candle.priceTiers || [],
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

  async function handleAddSize() {
    const valueCm = Number(newSize);
    if (!Number.isInteger(valueCm) || valueCm <= 0) {
      setError('Укажите размер целым числом больше нуля.');
      return;
    }

    setError('');
    try {
      const created = await createAdminCandleSize(valueCm);
      setSizes((current) => [...current, created].sort((a, b) => a.valueCm - b.valueCm));
      setNewSize('');
      setMessage(`Размер ${valueCm} см добавлен.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось добавить размер');
    }
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setIsImageUploading(true);
    try {
      const uploaded = await uploadAdminImage(file);
      updateField('imageUrl', uploaded.url);
      setMessage('Фотография загружена.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить фотографию');
    } finally {
      setIsImageUploading(false);
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

          <div className="admin-size-manager">
            <label>Новый размер, см
              <input min="1" step="1" type="number" value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="Например, 50" />
            </label>
            <button type="button" onClick={() => void handleAddSize()}>Добавить размер</button>
          </div>

          <div className="admin-form-grid">
            <label>Название<input required value={form.name} onChange={(e) => updateField('name', e.target.value)} /></label>
            <label>Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} /></label>
            <label>Цена, ₽<input required min="1" type="number" value={form.price} onChange={(e) => updateField('price', Number(e.target.value))} /></label>
            <label>Категория<select value={form.categoryId} onChange={(e) => updateField('categoryId', Number(e.target.value))}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label>Аромат<input required value={form.scent} onChange={(e) => updateField('scent', e.target.value)} /></label>
            <label>Цвет<input required value={form.color} onChange={(e) => updateField('color', e.target.value)} /></label>
            <label>Размер свечи
              <select required value={form.size} onChange={(e) => updateField('size', e.target.value)}>
                <option value="" disabled>Выберите размер</option>
                {sizes.map((size) => (
                  <option key={size.id} value={`${size.valueCm} см`}>{size.valueCm} см</option>
                ))}
              </select>
            </label>
            <label>Вес, г<input required min="1" type="number" value={form.weightGrams} onChange={(e) => updateField('weightGrams', Number(e.target.value))} /></label>
            <label>Горение, ч<input required min="1" type="number" value={form.burnTimeHours} onChange={(e) => updateField('burnTimeHours', Number(e.target.value))} /></label>
          </div>

          <label>Короткое описание<textarea required rows={2} value={form.shortDescription} onChange={(e) => updateField('shortDescription', e.target.value)} /></label>
          <label>Полное описание<textarea required rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} /></label>
          <label>Фотография свечи
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => void handleImageChange(event)}
            />
            <small>{isImageUploading ? 'Загружаем фотографию…' : 'Выберите JPG, PNG или WebP до 5 МБ'}</small>
          </label>

          <fieldset className="admin-price-tiers">
            <legend>Цены при покупке нескольких свечей</legend>
            <p>Укажите количество и цену за одну свечу. Выгода посчитается автоматически.</p>
            {form.priceTiers.map((tier, index) => (
              <div className="admin-price-tier-row" key={index}>
                <label>Количество
                  <input
                    min="2"
                    step="1"
                    type="number"
                    value={tier.quantity}
                    onChange={(event) => updateField('priceTiers', form.priceTiers.map((item, itemIndex) => (
                      itemIndex === index ? { ...item, quantity: Number(event.target.value) } : item
                    )))}
                  />
                </label>
                <label>Цена за 1 шт., ₽
                  <input
                    min="1"
                    step="0.01"
                    type="number"
                    value={tier.unitPrice}
                    onChange={(event) => updateField('priceTiers', form.priceTiers.map((item, itemIndex) => (
                      itemIndex === index ? { ...item, unitPrice: Number(event.target.value) } : item
                    )))}
                  />
                </label>
                <button type="button" onClick={() => updateField(
                  'priceTiers',
                  form.priceTiers.filter((_, itemIndex) => itemIndex !== index),
                )}>Удалить</button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateField('priceTiers', [
                ...form.priceTiers,
                { quantity: 2, unitPrice: form.price || 1 },
              ])}
            >
              + Добавить вариант количества
            </button>
          </fieldset>

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
              <div><strong>{candle.name}</strong><span>{candle.price.toLocaleString('ru-RU')} ₽ · {candle.categoryName}{candle.size ? ` · ${candle.size}` : ''}{candle.featured ? ' · Хит продаж' : ''}</span></div>
              <button type="button" onClick={() => editCandle(candle)}>Изменить</button>
              <button className="admin-hide-button" type="button" onClick={() => void handleHide(candle)}>Скрыть</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
