import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getStoredAuth, subscribeToAuth } from '../utils/auth';
import {
  getCartItems,
  getCartItemsCount,
  subscribeToCart,
} from '../utils/cart';

export function Header() {
  const [cartCount, setCartCount] = useState(() => getCartItemsCount());
  const [cartPulse, setCartPulse] = useState(false);
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let pulseTimer: number | undefined;

    const unsubscribe = subscribeToCart(() => {
      setCartCount(getCartItemsCount(getCartItems()));
      setCartPulse(false);

      window.requestAnimationFrame(() => {
        setCartPulse(true);
        pulseTimer = window.setTimeout(() => setCartPulse(false), 650);
      });
    });

    return () => {
      unsubscribe();
      window.clearTimeout(pulseTimer);
    };
  }, []);

  useEffect(() => {
    return subscribeToAuth(() => {
      setAuth(getStoredAuth());
      setCartCount(getCartItemsCount());
      setMobileMenuOpen(false);
    });
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', closeMenu);
    return () => window.removeEventListener('keydown', closeMenu);
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-mark">VS</span>
          <span>
            ВоскоСвет
            <small>свет природы и тепла</small>
          </span>
        </Link>

        <button
          className={`mobile-menu-toggle${mobileMenuOpen ? ' mobile-menu-toggle--open' : ''}`}
          type="button"
          aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={mobileMenuOpen}
          aria-controls="main-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`nav${mobileMenuOpen ? ' nav--open' : ''}`}
          id="main-navigation"
          onClick={() => setMobileMenuOpen(false)}
        >
          <NavLink to="/catalog">Каталог</NavLink>
          <a href="/#about">О нас</a>
          <NavLink to="/delivery-payment">Доставка и оплата</NavLink>
          <NavLink to="/orders/track">Отследить заказ</NavLink>
          <NavLink to="/reviews">Отзывы</NavLink>
          {auth?.role === 'ADMIN' ? <NavLink to="/admin">Кабинет</NavLink> : null}
        </nav>

        <Link
          className={`cart-link${cartPulse ? ' cart-link--pulse' : ''}`}
          to="/cart"
          aria-label="Корзина"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span>Корзина</span>
          <b>{cartCount}</b>
        </Link>
      </header>
    </>
  );
}
