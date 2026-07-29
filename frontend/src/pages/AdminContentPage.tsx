import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminNav } from '../components/AdminNav';
import {
  getAdminContent,
  getAdminCredentials,
  updateAdminContent,
  uploadAdminImage,
} from '../api/adminApi';
import { getUploadedImage } from '../utils/images';
import { defaultSiteContent, type SiteContent } from '../types/siteContent';

type ContentKey = keyof SiteContent;
type Field = { key: ContentKey; label: string; multiline?: boolean };

const homeTextFields: Field[] = [
  { key: 'home.heroTitle', label: 'Главный заголовок' },
  { key: 'home.heroSubtitle', label: 'Подзаголовок' },
  { key: 'home.heroButton', label: 'Текст кнопки' },
  { key: 'home.point1', label: 'Преимущество 1' },
  { key: 'home.point2', label: 'Преимущество 2' },
  { key: 'home.point3', label: 'Преимущество 3' },
  { key: 'home.aboutEyebrow', label: 'Надпись над разделом «О нас»' },
  { key: 'home.aboutTitle', label: 'Заголовок раздела «О нас»' },
  { key: 'home.aboutText', label: 'Текст раздела «О нас»', multiline: true },
  { key: 'home.aboutCaption1', label: 'Подпись изображения 1' },
  { key: 'home.aboutCaption2', label: 'Подпись изображения 2' },
  { key: 'home.aboutCaption3', label: 'Подпись изображения 3' },
];

const deliveryFields: Field[] = [
  { key: 'delivery.eyebrow', label: 'Надпись над заголовком' },
  { key: 'delivery.title', label: 'Заголовок страницы' },
  { key: 'delivery.paymentEyebrow', label: 'Надпись над оплатой' },
  { key: 'delivery.paymentTitle', label: 'Заголовок оплаты' },
  { key: 'delivery.paymentText', label: 'Описание оплаты', multiline: true },
];

const imageFields: Array<{ key: ContentKey; label: string }> = [
  { key: 'home.heroImage', label: 'Главное изображение' },
  { key: 'home.aboutImage1', label: 'Изображение «О нас» 1' },
  { key: 'home.aboutImage2', label: 'Изображение «О нас» 2' },
  { key: 'home.aboutImage3', label: 'Изображение «О нас» 3' },
];

export function AdminContentPage() {
  const credentials = getAdminCredentials();
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<ContentKey | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!credentials || credentials.role !== 'ADMIN') return;
    getAdminContent()
      .then((saved) => setContent({ ...defaultSiteContent, ...saved }))
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (!credentials) return <Navigate to="/login" replace />;
  if (credentials.role !== 'ADMIN') return <Navigate to="/admin" replace />;

  function updateField(key: ContentKey, value: string) {
    setContent((current) => ({ ...current, [key]: value }));
    setMessage('');
  }

  async function uploadImage(key: ContentKey, file: File | undefined) {
    if (!file) return;
    setUploadingKey(key);
    setError('');
    try {
      const uploaded = await uploadAdminImage(file);
      updateField(key, uploaded.url);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить изображение');
    } finally {
      setUploadingKey(null);
    }
  }

  async function saveContent() {
    setIsSaving(true);
    setError('');
    setMessage('');
    try {
      const saved = await updateAdminContent(content);
      setContent({ ...defaultSiteContent, ...saved });
      setMessage('Изменения опубликованы на сайте.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось сохранить контент');
    } finally {
      setIsSaving(false);
    }
  }

  function renderFields(fields: Field[]) {
    return fields.map((field) => (
      <label key={field.key}>
        {field.label}
        {field.multiline ? (
          <textarea rows={4} value={content[field.key]} onChange={(event) => updateField(field.key, event.target.value)} />
        ) : (
          <input value={content[field.key]} onChange={(event) => updateField(field.key, event.target.value)} />
        )}
      </label>
    ));
  }

  return (
    <section className="admin-page">
      <div className="admin-heading"><div><p className="eyebrow">Управление сайтом</p><h1>Контент страниц</h1></div></div>
      <div className="admin-shell">
        <AdminNav />
        {isLoading ? <p className="state-message">Загружаем контент...</p> : null}
        {error ? <p className="state-message state-message-error">{error}</p> : null}
        {message ? <p className="admin-success">{message}</p> : null}

        <form className="admin-form" onSubmit={(event) => { event.preventDefault(); void saveContent(); }}>
          <h2>Главная страница</h2>
          <div className="admin-form-grid">{renderFields(homeTextFields)}</div>

          <h2>Изображения главной</h2>
          <div className="admin-content-images">
            {imageFields.map((field) => (
              <label className="admin-content-image" key={field.key}>
                <span>{field.label}</span>
                <img src={getUploadedImage(content[field.key])} alt="" />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={uploadingKey === field.key}
                  onChange={(event) => void uploadImage(field.key, event.target.files?.[0])}
                />
                <small>{uploadingKey === field.key ? 'Загружаем...' : 'JPG, PNG или WebP, до 5 МБ'}</small>
              </label>
            ))}
          </div>

          <h2>Доставка и оплата</h2>
          <div className="admin-form-grid">{renderFields(deliveryFields)}</div>
          <div className="admin-form-actions">
            <button className="primary-link" disabled={isSaving || Boolean(uploadingKey)} type="submit">
              {isSaving ? 'Сохраняем...' : 'Опубликовать изменения'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
