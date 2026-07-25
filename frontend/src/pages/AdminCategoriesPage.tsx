import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminNav } from '../components/AdminNav';
import { createAdminCategory, getAdminCategories, getAdminCredentials } from '../api/adminApi';
import type { Category } from '../types/category';

export function AdminCategoriesPage() {
  const credentials = getAdminCredentials();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  async function load() { setCategories(await getAdminCategories()); }
  useEffect(() => { if (credentials) void load(); }, []);
  if (!credentials) return <Navigate to="/login" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await createAdminCategory(name, description);
      setName(''); setDescription(''); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось добавить категорию'); }
  }

  return (
    <section className="admin-page">
      <div className="admin-heading"><div><p className="eyebrow">Управление магазином</p><h1>Категории</h1></div></div>
      <div className="admin-shell"><AdminNav />
        <div className="admin-categories-layout">
          <form className="admin-form" onSubmit={submit}><h2>Новая категория</h2><label>Название<input required value={name} onChange={(e) => setName(e.target.value)} /></label><label>Описание<textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} /></label>{error ? <p className="state-message state-message-error">{error}</p> : null}<button className="primary-link">Добавить</button></form>
          <div className="admin-products"><h2>Категории каталога</h2>{categories.map((category) => <article className="admin-category-card" key={category.id}><div><strong>{category.name}</strong><p>{category.description || 'Без описания'}</p></div><span>{category.active ? 'Активна' : 'Скрыта'}</span></article>)}</div>
        </div>
      </div>
    </section>
  );
}
