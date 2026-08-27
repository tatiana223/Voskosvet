import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminNav } from '../components/AdminNav';
import {
  createAdminManager,
  getAdminCredentials,
  getAdminCustomers,
  updateAdminCustomerBlock,
  updateAdminCustomerRole,
  type AdminCustomer,
} from '../api/adminApi';
import type { FormEvent } from 'react';

export function AdminCustomersPage() {
  const credentials = getAdminCredentials();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [manager, setManager] = useState({ firstName: '', lastName: '', login: '', password: '' });

  useEffect(() => {
    if (credentials?.role === 'ADMIN') {
      getAdminCustomers().then(setCustomers).catch((e: Error) => setError(e.message));
    }
  }, []);

  if (!credentials) return <Navigate to="/login" replace />;
  if (credentials.role !== 'ADMIN') return <Navigate to="/admin" replace />;

  async function handleCreateManager(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsCreating(true);

    try {
      const created = await createAdminManager(manager);
      setCustomers((current) => [created, ...current]);
      setManager({ firstName: '', lastName: '', login: '', password: '' });
      setSuccess(`Кабинет менеджера «${created.fullName}» создан.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось создать менеджера');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRoleChange(customer: AdminCustomer, role: AdminCustomer['role']) {
    setError('');
    setSuccess('');
    setUpdatingId(customer.id);

    try {
      const updated = await updateAdminCustomerRole(customer.id, role);
      setCustomers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSuccess(`Роль пользователя «${customer.fullName}» изменена.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось изменить роль');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleBlockChange(customer: AdminCustomer) {
    let reason: string | undefined;

    if (!customer.blocked) {
      const enteredReason = window.prompt(
        `Укажите причину блокировки пользователя «${customer.fullName}»:`,
      );
      if (enteredReason === null) return;
      reason = enteredReason;
    } else if (!window.confirm(`Разблокировать пользователя «${customer.fullName}»?`)) {
      return;
    }

    setError('');
    setSuccess('');
    setUpdatingId(customer.id);

    try {
      const updated = await updateAdminCustomerBlock(customer.id, !customer.blocked, reason);
      setCustomers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSuccess(
        updated.blocked
          ? `Пользователь «${customer.fullName}» заблокирован.`
          : `Пользователь «${customer.fullName}» разблокирован.`,
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось изменить блокировку');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Доступ сотрудников</p>
          <h1>Пользователи и роли</h1>
        </div>
      </div>
      <div className="admin-shell">
        <AdminNav />
        <form className="admin-manager-form" onSubmit={handleCreateManager}>
          <div className="admin-manager-form-heading">
            <div>
              <p className="eyebrow">Новый сотрудник</p>
              <h2>Создать кабинет менеджера</h2>
            </div>
            <p>Менеджер войдёт в кабинет по указанным здесь логину и паролю.</p>
          </div>
          <div className="admin-manager-fields">
            <label>
              Имя
              <input required maxLength={100} value={manager.firstName} onChange={(event) => setManager({ ...manager, firstName: event.target.value })} />
            </label>
            <label>
              Фамилия
              <input required maxLength={100} value={manager.lastName} onChange={(event) => setManager({ ...manager, lastName: event.target.value })} />
            </label>
            <label>
              Логин
              <input required minLength={3} maxLength={100} autoComplete="off" pattern="[A-Za-z0-9._-]+" value={manager.login} onChange={(event) => setManager({ ...manager, login: event.target.value })} placeholder="manager1" />
            </label>
            <label>
              Пароль
              <input required minLength={6} maxLength={100} autoComplete="new-password" type="password" value={manager.password} onChange={(event) => setManager({ ...manager, password: event.target.value })} />
            </label>
          </div>
          <button className="primary-link" disabled={isCreating} type="submit">
            {isCreating ? 'Создаём...' : 'Создать менеджера'}
          </button>
        </form>
        <p className="admin-role-hint">
          Менеджер управляет каталогом и заказами. Администратор имеет полный доступ ко всем разделам.
        </p>
        {error ? <p className="state-message state-message-error">{error}</p> : null}
        {success ? <p className="admin-success">{success}</p> : null}
        <div className="admin-table">
          <div className="admin-table-row admin-table-head">
            <span>Имя</span><span>Телефон</span><span>Логин</span><span>Роль</span><span>Статус</span>
          </div>
          {customers.map((customer) => {
            const isCurrentUser = customer.id === credentials.id;

            return (
              <div className={`admin-table-row${customer.primaryAdmin ? ' admin-primary-row' : ''}`} key={customer.id}>
                <strong>
                  {customer.fullName}
                  {customer.primaryAdmin ? <small className="admin-primary-admin">★ Главный администратор</small> : null}
                  {isCurrentUser ? <small className="admin-current-user">Это вы</small> : null}
                </strong>
                <span>{customer.phone}</span>
                <span>{customer.email || '—'}</span>
                <select
                  aria-label={`Роль пользователя ${customer.fullName}`}
                  disabled={customer.primaryAdmin || isCurrentUser || updatingId === customer.id}
                  value={customer.role}
                  onChange={(event) => handleRoleChange(
                    customer,
                    event.target.value as AdminCustomer['role'],
                  )}
                >
                  <option value="USER">Пользователь</option>
                  <option value="MANAGER">Менеджер</option>
                  <option value="ADMIN">Администратор</option>
                </select>
                <div className="admin-user-status">
                  <span className={customer.blocked ? 'admin-blocked-status' : 'admin-active-status'}>
                    {customer.blocked ? 'Заблокирован' : 'Активен'}
                  </span>
                  {customer.blockedReason ? <small title={customer.blockedReason}>{customer.blockedReason}</small> : null}
                  {customer.blockedAt ? <time>{new Date(customer.blockedAt).toLocaleDateString('ru-RU')}</time> : null}
                  <button
                    className={customer.blocked ? 'admin-unblock-button' : 'admin-block-button'}
                    disabled={customer.primaryAdmin || isCurrentUser || updatingId === customer.id}
                    type="button"
                    onClick={() => void handleBlockChange(customer)}
                  >
                    {customer.blocked ? 'Разблокировать' : 'Заблокировать'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
