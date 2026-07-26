import { NavLink } from 'react-router-dom';

export function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Разделы управления">
      <NavLink to="/admin">Обзор</NavLink>
      <NavLink to="/admin/orders">Заказы и доставка</NavLink>
      <NavLink to="/admin/candles">Свечи</NavLink>
      <NavLink to="/admin/categories">Категории</NavLink>
      <NavLink to="/admin/reviews">Отзывы</NavLink>
      <NavLink to="/admin/customers">Клиенты</NavLink>
    </nav>
  );
}
