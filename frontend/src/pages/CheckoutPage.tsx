import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createOrder } from '../api/ordersApi';
import type { FormEvent } from 'react';
import type { ContactMethod, DeliveryMethod, PaymentMethod } from '../types/order';
import {
  clearCart,
  getCartItems,
  getCartTotal,
  removeFromCart,
  subscribeToCart,
  updateCartItemQuantity,
  type CartItem,
} from '../utils/cart';
import { getStoredAuth } from '../utils/auth';
import { getCandleImage, useCandleImageFallback } from '../utils/images';

type CheckoutForm = {
  customerFullName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  deliveryAddress: string;
  deliveryComment: string;
  comment: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  preferredContactMethod: ContactMethod;
};

const initialForm: CheckoutForm = {
  customerFullName: '',
  customerPhone: '',
  customerEmail: '',
  city: '',
  deliveryAddress: '',
  deliveryComment: '',
  comment: '',
  deliveryMethod: 'CDEK',
  paymentMethod: 'TRANSFER',
  preferredContactMethod: 'WHATSAPP',
};

export function CheckoutPage() {
  const auth = getStoredAuth();
  const [items, setItems] = useState<CartItem[]>(() => getCartItems());
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    return subscribeToCart(() => setItems(getCartItems()));
  }, []);

  useEffect(() => {
    const auth = getStoredAuth();

    if (!auth) {
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      customerFullName: currentForm.customerFullName || auth.fullName,
      customerEmail: currentForm.customerEmail || auth.email,
    }));
  }, []);

  const total = getCartTotal(items);

  function updateField<K extends keyof CheckoutForm>(field: K, value: CheckoutForm[K]) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (items.length === 0) {
      setError('Сначала добавь свечи в корзину.');
      return;
    }

    setIsSubmitting(true);

    createOrder({
      customerFullName: form.customerFullName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail || undefined,
      deliveryMethod: form.deliveryMethod,
      city: form.city || undefined,
      deliveryAddress: form.deliveryAddress || undefined,
      deliveryComment: form.deliveryComment || undefined,
      preferredContactMethod: form.preferredContactMethod,
      paymentMethod: form.paymentMethod,
      comment: form.comment || undefined,
      items: items.map((item) => ({
        candleId: item.candle.id,
        quantity: item.quantity,
      })),
    })
      .then((order) => {
        clearCart();
        setForm(initialForm);
        setCreatedOrderId(order.id);
        setMessage(
          auth
            ? `Заказ №${order.id} отправлен. Он сохранён в вашем личном кабинете.`
            : `Заказ №${order.id} отправлен. Сохраните номер заказа и телефон для отслеживания.`
        );
      })
      .catch(() => {
        setError('Не получилось отправить заказ. Проверь, что backend запущен.');
      })
      .finally(() => setIsSubmitting(false));
  }

  return (
    <section className="checkout-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Корзина</p>
          <h1>Оформление заказа</h1>
        </div>
        <Link to="/catalog">Вернуться в каталог</Link>
      </div>

      {!auth ? (
        <aside className="guest-benefits">
          <div>
            <strong>Можно заказать без регистрации</strong>
            <span>Войдите, чтобы данные заполнялись автоматически, все заказы были в одном месте и в будущем можно было получать персональные скидки.</span>
          </div>
          <div className="auth-actions">
            <Link className="secondary-link" to="/login">Войти</Link>
            <Link className="secondary-link" to="/register">Создать аккаунт</Link>
          </div>
        </aside>
      ) : null}

      <div className="checkout-layout checkout-layout--form">
        <div className="cart-panel">
          <h2>Ваши свечи</h2>

          {items.length === 0 ? (
            <div className="empty-cart">
              <p>Корзина пока пустая.</p>
              <Link className="primary-link" to="/catalog">
                Выбрать свечи
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-list">
                {items.map((item) => (
                  <article className="cart-item" key={item.candle.id}>
                    <img
                      src={getCandleImage(item.candle.imageUrl)}
                      alt={item.candle.name}
                      onError={useCandleImageFallback}
                    />
                    <div>
                      <h3>{item.candle.name}</h3>
                      <p>{item.candle.shortDescription || item.candle.categoryName}</p>
                      <strong>{item.candle.price.toLocaleString('ru-RU')} ₽</strong>
                    </div>
                    <div className="cart-item-actions">
                      <label>
                        <span>Кол-во</span>
                        <input
                          min="1"
                          type="number"
                          value={item.quantity}
                          onChange={(event) =>
                            updateCartItemQuantity(item.candle.id, Number(event.target.value))
                          }
                        />
                      </label>
                      <button type="button" onClick={() => removeFromCart(item.candle.id)}>
                        Удалить
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="cart-total">
                <span>Итого</span>
                <strong>{total.toLocaleString('ru-RU')} ₽</strong>
              </div>
            </>
          )}
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Контакты и доставка</h2>

          <div className="checkout-summary">
            <div>
              <span>В заказе</span>
              <strong>{items.reduce((sum, item) => sum + item.quantity, 0)} товаров</strong>
            </div>
            <div>
              <span>Сумма</span>
              <strong>{total.toLocaleString('ru-RU')} ₽</strong>
            </div>
            <Link to="/cart">Изменить корзину</Link>
          </div>

          <div className="form-grid">
            <label>
              Имя и фамилия
              <input
                required
                value={form.customerFullName}
                onChange={(event) => updateField('customerFullName', event.target.value)}
                placeholder="Татьяна Иванова"
              />
            </label>

            <label>
              Телефон
              <input
                required
                value={form.customerPhone}
                onChange={(event) => updateField('customerPhone', event.target.value)}
                placeholder="+7 999 123-45-67"
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={form.customerEmail}
                onChange={(event) => updateField('customerEmail', event.target.value)}
                placeholder="mail@example.ru"
              />
            </label>

            <label>
              Как связаться
              <select
                value={form.preferredContactMethod}
                onChange={(event) =>
                  updateField('preferredContactMethod', event.target.value as ContactMethod)
                }
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="TELEGRAM">Telegram</option>
                <option value="PHONE">Звонок</option>
                <option value="EMAIL">Email</option>
              </select>
            </label>

            <label>
              Способ доставки
              <select
                value={form.deliveryMethod}
                onChange={(event) => updateField('deliveryMethod', event.target.value as DeliveryMethod)}
              >
                <option value="CDEK">СДЭК</option>
                <option value="POST">Почта России</option>
                <option value="COURIER">Курьер</option>
                <option value="PICKUP">Самовывоз</option>
              </select>
            </label>

            <label>
              Оплата
              <select
                value={form.paymentMethod}
                onChange={(event) => updateField('paymentMethod', event.target.value as PaymentMethod)}
              >
                <option value="TRANSFER">Перевод</option>
                <option value="CARD_ONLINE">Картой онлайн</option>
                <option value="CASH">Наличными</option>
              </select>
            </label>

            <label>
              Город
              <input
                value={form.city}
                onChange={(event) => updateField('city', event.target.value)}
                placeholder="Москва"
              />
            </label>

            <label>
              Адрес доставки
              <input
                value={form.deliveryAddress}
                onChange={(event) => updateField('deliveryAddress', event.target.value)}
                placeholder="Улица, дом, квартира"
              />
            </label>
          </div>

          <label>
            Комментарий к доставке
            <textarea
              value={form.deliveryComment}
              onChange={(event) => updateField('deliveryComment', event.target.value)}
              rows={3}
              placeholder="Например: удобное время, пункт выдачи, детали адреса"
            />
          </label>

          <label>
            Комментарий к заказу
            <textarea
              value={form.comment}
              onChange={(event) => updateField('comment', event.target.value)}
              rows={3}
              placeholder="Пожелания по упаковке или набору"
            />
          </label>

          {message ? <p className="state-message">{message}</p> : null}
          {createdOrderId && !auth ? (
            <Link className="secondary-link checkout-tracking-link" to="/orders/track">
              Отследить заказ №{createdOrderId}
            </Link>
          ) : null}
          {error ? <p className="state-message state-message-error">{error}</p> : null}

          <button className="primary-link" disabled={isSubmitting || items.length === 0} type="submit">
            {isSubmitting ? 'Отправляем...' : 'Отправить заказ'}
          </button>
        </form>
      </div>
    </section>
  );
}
