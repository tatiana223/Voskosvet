import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, updateCurrentUser } from '../api/authApi';
import { getMyOrders } from '../api/ordersApi';
import type { AuthResponse, UpdateProfileRequest } from '../types/auth';
import type { OrderResponse, OrderStatus } from '../types/order';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '../utils/auth';

const statusLabels: Record<OrderStatus, string> = {
  NEW: 'Новый',
  CONFIRMED: 'Подтвержден',
  IN_PROGRESS: 'В работе',
  SHIPPED: 'Отправлен',
  COMPLETED: 'Завершен',
  CANCELLED: 'Отменен',
};

const deliveryLabels: Record<string, string> = {
  PICKUP: 'Самовывоз',
  COURIER: 'Курьер',
  CDEK: 'СДЭК',
  POST: 'Почта России',
};

function profileFromUser(user: AuthResponse): UpdateProfileRequest {
  return {
    fullName: user.fullName,
    phone: user.phone || '',
    email: user.email,
    city: user.city || '',
    deliveryAddress: user.deliveryAddress || '',
    preferredContactMethod: user.preferredContactMethod || 'WHATSAPP',
    defaultDeliveryMethod: user.defaultDeliveryMethod || 'CDEK',
    defaultPaymentMethod: user.defaultPaymentMethod || 'TRANSFER',
  };
}

export function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthResponse | null>(() => getStoredAuth());
  const [profile, setProfile] = useState<UpdateProfileRequest | null>(
    user ? profileFromUser(user) : null,
  );
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const storedAuth = getStoredAuth();

    if (!storedAuth) {
      navigate('/login');
      return;
    }

    Promise.all([getCurrentUser(), getMyOrders()])
      .then(([currentUser, currentOrders]) => {
        const userWithToken = { ...currentUser, token: storedAuth.token };
        setUser(userWithToken);
        setProfile(profileFromUser(userWithToken));
        setStoredAuth(userWithToken);
        setOrders(currentOrders);
      })
      .catch(() => {
        clearStoredAuth();
        navigate('/login');
      })
      .finally(() => setIsLoading(false));
  }, [navigate]);

  function updateProfileField<K extends keyof UpdateProfileRequest>(
    field: K,
    value: UpdateProfileRequest[K],
  ) {
    setProfile((current) => current ? { ...current, [field]: value } : current);
  }

  function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setIsSaving(true);
    setProfileMessage('');
    setProfileError('');

    updateCurrentUser(profile)
      .then((updatedUser) => {
        setUser(updatedUser);
        setProfile(profileFromUser(updatedUser));
        setStoredAuth(updatedUser);
        setProfileMessage('Данные сохранены. При следующем заказе они заполнятся автоматически.');
      })
      .catch((error: Error) => setProfileError(error.message || 'Не удалось сохранить данные.'))
      .finally(() => setIsSaving(false));
  }

  function handleLogout() {
    clearStoredAuth();
    navigate('/');
  }

  if (isLoading) {
    return <section className="account-page"><p className="state-message">Загружаем личный кабинет...</p></section>;
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <section className="account-page">
      <div className="account-hero">
        <div>
          <p className="eyebrow">Личный кабинет</p>
          <h1>{user.fullName}</h1>
          <p>Данные для быстрых заказов и вся история покупок в одном месте.</p>
        </div>
        <button type="button" onClick={handleLogout}>Выйти</button>
      </div>

      <div className="account-layout">
        <form className="account-panel account-profile-form" onSubmit={handleProfileSubmit}>
          <div className="panel-title-row">
            <h2>Мои данные</h2>
            <span>Автозаполнение заказа</span>
          </div>

          <label>
            Имя и фамилия
            <input required value={profile.fullName} onChange={(event) => updateProfileField('fullName', event.target.value)} />
          </label>
          <label>
            Телефон
            <input required value={profile.phone} onChange={(event) => updateProfileField('phone', event.target.value)} />
          </label>
          <label>
            Email
            <input required type="email" value={profile.email} onChange={(event) => updateProfileField('email', event.target.value)} />
          </label>
          <label>
            Город
            <input value={profile.city} onChange={(event) => updateProfileField('city', event.target.value)} placeholder="Москва" />
          </label>
          <label>
            Адрес доставки
            <input value={profile.deliveryAddress} onChange={(event) => updateProfileField('deliveryAddress', event.target.value)} placeholder="Улица, дом, квартира" />
          </label>
          <label>
            Как связаться
            <select value={profile.preferredContactMethod} onChange={(event) => updateProfileField('preferredContactMethod', event.target.value as UpdateProfileRequest['preferredContactMethod'])}>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="TELEGRAM">Telegram</option>
              <option value="PHONE">Звонок</option>
              <option value="EMAIL">Email</option>
            </select>
          </label>
          <label>
            Обычная доставка
            <select value={profile.defaultDeliveryMethod} onChange={(event) => updateProfileField('defaultDeliveryMethod', event.target.value as UpdateProfileRequest['defaultDeliveryMethod'])}>
              <option value="CDEK">СДЭК</option>
              <option value="POST">Почта России</option>
              <option value="COURIER">Курьер</option>
              <option value="PICKUP">Самовывоз</option>
            </select>
          </label>
          <label>
            Обычная оплата
            <select value={profile.defaultPaymentMethod} onChange={(event) => updateProfileField('defaultPaymentMethod', event.target.value as UpdateProfileRequest['defaultPaymentMethod'])}>
              <option value="TRANSFER">Перевод</option>
              <option value="CARD_ONLINE">Картой онлайн</option>
              <option value="CASH">Наличными</option>
            </select>
          </label>

          {profileMessage ? <p className="state-message">{profileMessage}</p> : null}
          {profileError ? <p className="state-message state-message-error">{profileError}</p> : null}

          <button className="primary-link" disabled={isSaving} type="submit">
            {isSaving ? 'Сохраняем...' : 'Сохранить данные'}
          </button>
          <Link className="secondary-link" to="/cart">Перейти к оформлению</Link>

          {user.role === 'ADMIN' || user.role === 'MANAGER' ? (
            <div className="account-admin-actions">
              <p className="eyebrow">Управление магазином</p>
              <Link className="primary-link" to="/admin">Открыть панель управления</Link>
            </div>
          ) : null}
        </form>

        <article className="account-panel orders-panel">
          <div className="panel-title-row">
            <div>
              <h2>Мои заказы</h2>
              <span>Статус и подробности без повторного ввода данных</span>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="empty-cart">
              <p>Заказов пока нет.</p>
              <Link className="primary-link" to="/catalog">Выбрать свечи</Link>
            </div>
          ) : (
            <div className="account-orders">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;

                return (
                  <article key={order.id} className="account-order">
                    <div>
                      <strong>Заказ №{order.id}</strong>
                      <span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div>
                      <span className="account-order-status">{statusLabels[order.status]}</span>
                      <b>{order.totalPrice.toLocaleString('ru-RU')} ₽</b>
                    </div>
                    <small>{order.items.map((item) => `${item.candleName} × ${item.quantity}`).join(', ')}</small>
                    <button
                      className="account-order-toggle"
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    >
                      {isExpanded ? 'Скрыть подробности' : 'Подробнее и статус'}
                    </button>

                    {isExpanded ? (
                      <div className="account-order-details">
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
                        <dl>
                          <div><dt>Доставка</dt><dd>{deliveryLabels[order.deliveryMethod]}</dd></div>
                          {order.city ? <div><dt>Город</dt><dd>{order.city}</dd></div> : null}
                          {order.deliveryAddress ? <div><dt>Адрес</dt><dd>{order.deliveryAddress}</dd></div> : null}
                        </dl>
                        <div className="tracked-items">
                          {order.items.map((item) => (
                            <article key={item.id}>
                              <span>{item.candleName}</span>
                              <small>{item.quantity} шт.</small>
                              <strong>{item.subtotal.toLocaleString('ru-RU')} ₽</strong>
                            </article>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
