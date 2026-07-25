import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminNav } from '../components/AdminNav';
import { getAdminCredentials, getAdminOrders, updateAdminOrderStatus } from '../api/adminApi';
import type { OrderResponse, OrderStatus } from '../types/order';

const statusLabels: Record<OrderStatus, string> = {
  NEW: 'Новый',
  CONFIRMED: 'Подтверждён',
  IN_PROGRESS: 'Собирается',
  SHIPPED: 'Передан в доставку',
  COMPLETED: 'Выполнен',
  CANCELLED: 'Отменён',
};

const deliveryLabels = {
  PICKUP: 'Самовывоз',
  COURIER: 'Курьер',
  CDEK: 'СДЭК',
  POST: 'Почта России',
};

export function AdminOrdersPage() {
  const credentials = getAdminCredentials();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const [error, setError] = useState('');

  async function loadOrders() {
    try {
      const page = await getAdminOrders(filter || undefined);
      setOrders(page.items);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить заказы');
    }
  }

  useEffect(() => { if (credentials) void loadOrders(); }, [filter]);

  if (!credentials) return <Navigate to="/login" replace />;

  async function changeStatus(order: OrderResponse, status: OrderStatus) {
    try {
      const updated = await updateAdminOrderStatus(order.id, status);
      setOrders((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось изменить статус');
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-heading"><div><p className="eyebrow">Управление магазином</p><h1>Заказы и доставка</h1></div></div>
      <div className="admin-shell">
        <AdminNav />
        <div className="admin-toolbar">
          <label>Показать<select value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | '')}><option value="">Все заказы</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </div>
        {error ? <p className="state-message state-message-error">{error}</p> : null}
        <div className="admin-orders">
          {orders.length === 0 ? <p className="state-message">Заказов пока нет.</p> : orders.map((order) => (
            <article className="admin-order-card" key={order.id}>
              <div className="admin-order-title"><div><strong>Заказ №{order.id}</strong><time>{new Date(order.createdAt).toLocaleString('ru-RU')}</time></div><b>{order.totalPrice.toLocaleString('ru-RU')} ₽</b></div>
              <div className="admin-order-grid">
                <div><span>Покупатель</span><strong>{order.customer.fullName}</strong><a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a><small>{order.customer.email}</small></div>
                <div><span>Доставка</span><strong>{deliveryLabels[order.deliveryMethod]}</strong><small>{order.city}{order.deliveryAddress ? `, ${order.deliveryAddress}` : ''}</small><small>{order.deliveryComment}</small></div>
                <div><span>Состав</span>{order.items.map((item) => <small key={item.id}>{item.candleName} × {item.quantity}</small>)}</div>
                <label><span>Статус</span><select value={order.status} onChange={(e) => void changeStatus(order, e.target.value as OrderStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
