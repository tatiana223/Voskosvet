import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AdminNav } from '../components/AdminNav';
import { getAdminCandles, getAdminCategories, getAdminCredentials, getAdminOrders } from '../api/adminApi';

export function AdminDashboardPage() {
  const credentials = getAdminCredentials();
  const [stats, setStats] = useState({ candles: 0, orders: 0, newOrders: 0, categories: 0 });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!credentials) return;

    Promise.all([getAdminCandles(), getAdminOrders(), getAdminCategories()])
      .then(([candles, orders, categories]) => setStats({
        candles: candles.items.length,
        orders: orders.items.length,
        newOrders: orders.items.filter((order) => order.status === 'NEW').length,
        categories: categories.length,
      }))
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (!credentials) return <Navigate to="/login" replace />;

  return (
    <section className="admin-page">
      <div className="admin-heading"><div><p className="eyebrow">Управление магазином</p><h1>Обзор</h1></div></div>
      <div className="admin-shell">
        <AdminNav />
        {isLoading ? <p className="state-message">Сервер запускается, загружаем данные магазина…</p> : null}
        {error ? <p className="state-message state-message-error">{error}</p> : null}
        <div className="admin-stats">
          <Link to="/admin/orders"><span>Новые заказы</span><strong>{stats.newOrders}</strong><small>Требуют внимания</small></Link>
          <Link to="/admin/orders"><span>Все заказы</span><strong>{stats.orders}</strong><small>За всё время</small></Link>
          <Link to="/admin/candles"><span>Свечи</span><strong>{stats.candles}</strong><small>В каталоге</small></Link>
          <Link to="/admin/categories"><span>Категории</span><strong>{stats.categories}</strong><small>Разделы каталога</small></Link>
        </div>
        <div className="admin-quick-actions">
          <h2>Быстрые действия</h2>
          <Link className="primary-link" to="/admin/orders">Обработать заказы</Link>
          <Link className="secondary-link" to="/admin/candles">Добавить свечу</Link>
        </div>
      </div>
    </section>
  );
}
