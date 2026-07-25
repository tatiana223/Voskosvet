import { useState } from 'react';
import { trackOrder } from '../api/ordersApi';
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
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setOrder(null);
    setIsLoading(true);

    trackOrder(orderId, phone)
      .then(setOrder)
      .catch(() => setError('Заказ не найден. Проверь номер заказа и телефон.'))
      .finally(() => setIsLoading(false));
  }

  return (
    <section className="tracking-page">
      <div className="tracking-hero">
        <p className="eyebrow">Отслеживание</p>
        <h1>Проверить статус заказа</h1>
        <p>
          Введите номер заказа и телефон, который был указан при оформлении.
          Так мы покажем только ваш заказ.
        </p>
      </div>

      <div className="tracking-layout">
        <form className="tracking-form" onSubmit={handleSubmit}>
          <label>
            Номер заказа
            <input
              required
              inputMode="numeric"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="Например: 12"
            />
          </label>

          <label>
            Телефон
            <input
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+7 999 123-45-67"
            />
          </label>

          <button className="primary-link" type="submit" disabled={isLoading}>
            {isLoading ? 'Ищем...' : 'Найти заказ'}
          </button>

          {error ? <p className="state-message state-message-error">{error}</p> : null}
        </form>

        <div className="tracking-result">
          {order ? (
            <>
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
                    <small>{item.quantity} шт.</small>
                    <strong>{item.subtotal.toLocaleString('ru-RU')} ₽</strong>
                  </article>
                ))}
              </div>

              <div className="cart-total">
                <span>Итого</span>
                <strong>{order.totalPrice.toLocaleString('ru-RU')} ₽</strong>
              </div>
            </>
          ) : (
            <p className="state-message">
              Здесь появится статус заказа, состав и итоговая сумма.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
