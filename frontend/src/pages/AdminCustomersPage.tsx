import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminNav } from '../components/AdminNav';
import { getAdminCredentials, getAdminCustomers, type AdminCustomer } from '../api/adminApi';

export function AdminCustomersPage() {
  const credentials = getAdminCredentials();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (credentials) getAdminCustomers().then(setCustomers).catch((e: Error) => setError(e.message));
  }, []);

  if (!credentials) return <Navigate to="/login" replace />;

  return (
    <section className="admin-page">
      <div className="admin-heading"><div><p className="eyebrow">Управление магазином</p><h1>Клиенты</h1></div></div>
      <div className="admin-shell"><AdminNav />{error ? <p className="state-message state-message-error">{error}</p> : null}
        <div className="admin-table">
          <div className="admin-table-row admin-table-head"><span>Имя</span><span>Телефон</span><span>Email</span><span>Роль</span></div>
          {customers.map((customer) => <div className="admin-table-row" key={customer.id}><strong>{customer.fullName}</strong><span>{customer.phone}</span><span>{customer.email || '—'}</span><span>{customer.role}</span></div>)}
        </div>
      </div>
    </section>
  );
}
