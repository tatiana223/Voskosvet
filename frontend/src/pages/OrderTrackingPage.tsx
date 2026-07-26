import { useState } from 'react';
import { Link } from 'react-router-dom';
import { trackOrders } from '../api/ordersApi';
import type { FormEvent } from 'react';
import type { OrderResponse, OrderStatus } from '../types/order';

const statusLabels: Record<OrderStatus, string> = {
  NEW: 'Новый',
  CONFIRMED: 'Подтвержден',
  IN_PROGRESS: 'В работе',
  SHIPPED: 'Передан в доставку',
  COMPLETED: 'Завершен',
  CANCELLED: 'Отменен',
};

export function OrderTrackingPage() {
  const [phone, setPhone] = useState('');
  const [surname, setSurname] = useState('');
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setOrders([]);
    setIsLoading(true);

    trackOrders(phone, surname)
      .then(setOrders)
      .catch(() => setError('Заказы не найдены. Проверьте телефон и фамилию.'))
      .finally(() => setIsLoading(false));
  }

  return (
    <section className="tracking-page">
      <div className="tracking-hero">
        <p className="eyebrow">Отслеживание</p>
        <h1>Проверить статус заказа</h1>
        <p>
          Введите телефон и фамилию, которые были указаны при оформлении.
          Мы покажем все ваши заказы — номер заказа помнить не нужно.
        </p>
      </div>

      <aside className="tracking-account-note">
        <span>Оформляли заказ без регистрации? Введите телефон и фамилию ниже.</span>
        <span>После входа отслеживать проще: все заказы сохраняются в личном кабинете, а зарегистрированные покупатели смогут получать персональные скидки.</span>
        <Link to="/login">Войти в аккаунт</Link>
      </aside>

      <div className="tracking-layout">
        <form className="tracking-form" onSubmit={handleSubmit}>
          <label>
            Телефон
            <input
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+7 999 123-45-67"
            />
          </label>

          <label>
            Фамилия
            <input
              required
              value={surname}
              onChange={(event) => setSurname(event.target.value)}
              placeholder="Например: Иванова"
            />
          </label>

          <button className="primary-link" type="submit" disabled={isLoading}>
            {isLoading ? 'Ищем...' : 'Найти заказы'}
          </button>

          {error ? <p className="state-message state-message-error">{error}</p> : null}
        </form>

        <div className="tracking-results">
          {orders.length ? (
            orders.map((order) => (
              <article className="tracking-result" key={order.id}>
              <div className="tracking-status">
                <span>Заказ №{order.id}</span>
                <strong>{statusLabels[order.status]}</strong>
              </div>

              <div className="tracking-steps">
                {Object.entries(statusLabels)
                  .filter(([status]) => status !== 'CANCELLED')
                  .map(([status, label]) => (
                    <div className={status === order.status ? 'active' : ''} key={status}>
                      <i />
                      <span>{label}</span>
                    </div>
                  ))}
              </div>

              <div className="tracked-items">
                {order.items.map((item) => (
                  <article key={item.id}>
                    <span>{item.candleName}</span>
                    <small>{item.boxQuantity} кор. × {item.packageSize} шт.</small>
                    <strong>{item.subtotal.toLocaleString('ru-RU')} ₽</strong>
                  </article>
                ))}
              </div>

              <div className="cart-total">
                <span>Итого</span>
                <strong>{order.totalPrice.toLocaleString('ru-RU')} ₽</strong>
              </div>
              </article>
            ))
          ) : (
            <p className="tracking-result state-message">
              Здесь появится статус заказа, состав и итоговая сумма.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
