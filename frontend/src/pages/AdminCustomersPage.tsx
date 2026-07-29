import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminNav } from '../components/AdminNav';
import {
  getAdminCredentials,
  getAdminCustomers,
  updateAdminCustomerRole,
  type AdminCustomer,
} from '../api/adminApi';

export function AdminCustomersPage() {
  const credentials = getAdminCredentials();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (credentials?.role === 'ADMIN') {
      getAdminCustomers().then(setCustomers).catch((e: Error) => setError(e.message));
    }
  }, []);

  if (!credentials) return <Navigate to="/login" replace />;
  if (credentials.role !== 'ADMIN') return <Navigate to="/admin" replace />;

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
        <p className="admin-role-hint">
          Менеджер управляет каталогом и заказами. Администратор имеет полный доступ ко всем разделам.
        </p>
        {error ? <p className="state-message state-message-error">{error}</p> : null}
        {success ? <p className="admin-success">{success}</p> : null}
        <div className="admin-table">
          <div className="admin-table-row admin-table-head">
            <span>Имя</span><span>Телефон</span><span>Email</span><span>Роль</span>
          </div>
          {customers.map((customer) => {
            const isCurrentUser = customer.id === credentials.id;

            return (
              <div className="admin-table-row" key={customer.id}>
                <strong>
                  {customer.fullName}
                  {isCurrentUser ? <small className="admin-current-user">Это вы</small> : null}
                </strong>
                <span>{customer.phone}</span>
                <span>{customer.email || '—'}</span>
                <select
                  aria-label={`Роль пользователя ${customer.fullName}`}
                  disabled={isCurrentUser || updatingId === customer.id}
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
