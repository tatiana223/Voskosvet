import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/authApi';
import { getMyOrders } from '../api/ordersApi';
import type { AuthResponse } from '../types/auth';
import type { OrderResponse } from '../types/order';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '../utils/auth';

const statusLabels: Record<string, string> = {
  NEW: 'Новый',
  CONFIRMED: 'Подтвержден',
  IN_PROGRESS: 'В работе',
  SHIPPED: 'Отправлен',
  COMPLETED: 'Завершен',
  CANCELLED: 'Отменен',
};

export function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthResponse | null>(() => getStoredAuth());
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAuth = getStoredAuth();

    if (!storedAuth) {
      navigate('/login');
      return;
    }

    Promise.all([getCurrentUser(), getMyOrders()])
      .then(([currentUser, currentOrders]) => {
        setUser({ ...currentUser, token: storedAuth.token });
        setStoredAuth({ ...currentUser, token: storedAuth.token });
        setOrders(currentOrders);
      })
      .catch(() => {
        clearStoredAuth();
        navigate('/login');
      })
      .finally(() => setIsLoading(false));
  }, [navigate]);

  function handleLogout() {
    clearStoredAuth();
    navigate('/');
  }

  if (isLoading) {
    return (
      <section className="account-page">
        <p className="state-message">Загружаем личный кабинет...</p>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <section className="account-page">
      <div className="account-hero">
        <div>
          <p className="eyebrow">Личный кабинет</p>
          <h1>{user.fullName}</h1>
          <p>{user.email}</p>
        </div>
        <button type="button" onClick={handleLogout}>
          Выйти
        </button>
      </div>

      <div className="account-layout">
        <article className="account-panel">
          <h2>Профиль</h2>
          <dl className="profile-list">
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Роль</dt>
              <dd>{user.role}</dd>
            </div>
          </dl>
          <Link className="primary-link" to="/checkout">
            Перейти к оформлению
          </Link>
          {user.role === 'ADMIN' || user.role === 'MANAGER' ? (
            <div className="account-admin-actions">
              <p className="eyebrow">Управление магазином</p>
              <Link className="primary-link" to="/admin">
                Открыть панель управления
              </Link>
            </div>
          ) : null}
        </article>

        <article className="account-panel orders-panel">
          <div className="panel-title-row">
            <h2>Мои заказы</h2>
          </div>

          {orders.length === 0 ? (
            <div className="empty-cart">
              <p>Заказов пока нет.</p>
              <Link className="primary-link" to="/catalog">
                Выбрать свечи
              </Link>
            </div>
          ) : (
            <div className="account-orders">
              {orders.map((order) => (
                <article key={order.id} className="account-order">
                  <div>
                    <strong>Заказ №{order.id}</strong>
                    <span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div>
                    <span>{statusLabels[order.status] ?? order.status}</span>
                    <b>{order.totalPrice.toLocaleString('ru-RU')} ₽</b>
                  </div>
                  <small>
                    {order.items.map((item) => `${item.candleName} × ${item.quantity}`).join(', ')}
                  </small>
                </article>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
