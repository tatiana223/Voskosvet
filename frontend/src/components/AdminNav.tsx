import { NavLink } from 'react-router-dom';
import { getStoredAuth } from '../utils/auth';

export function AdminNav() {
  const isAdmin = getStoredAuth()?.role === 'ADMIN';

  return (
    <nav className="admin-nav" aria-label="Разделы управления">
      <NavLink to="/admin">Обзор</NavLink>
      <NavLink to="/admin/orders">Заказы и доставка</NavLink>
      <NavLink to="/admin/candles">Свечи</NavLink>
      <NavLink to="/admin/categories">Категории</NavLink>
      {isAdmin ? <NavLink to="/admin/reviews">Отзывы</NavLink> : null}
      {isAdmin ? <NavLink to="/admin/customers">Сотрудники</NavLink> : null}
      {isAdmin ? <NavLink to="/admin/content">Контент сайта</NavLink> : null}
    </nav>
  );
}
