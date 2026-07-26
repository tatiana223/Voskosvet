import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { AccountPage } from './pages/AccountPage';
import { AdminCandlesPage } from './pages/AdminCandlesPage';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';
import { AdminCustomersPage } from './pages/AdminCustomersPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminReviewsPage } from './pages/AdminReviewsPage';
import { CandlePage } from './pages/CandlePage';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { DeliveryPaymentPage } from './pages/DeliveryPaymentPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { LoginPage } from './pages/LoginPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { RegisterPage } from './pages/RegisterPage';
import { WelcomePage } from './pages/WelcomePage';

export function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:slug" element={<CandlePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/delivery-payment" element={<DeliveryPaymentPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/orders/track" element={<OrderTrackingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin/candles" element={<AdminCandlesPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
