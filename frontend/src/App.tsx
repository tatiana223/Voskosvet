import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { AdminCandlesPage } from './pages/AdminCandlesPage';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';
import { AdminCustomersPage } from './pages/AdminCustomersPage';
import { AdminContentPage } from './pages/AdminContentPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminReviewsPage } from './pages/AdminReviewsPage';
import { CandlePage } from './pages/CandlePage';
import { CartPage } from './pages/CartPage';
import { PaymentResultPage } from './pages/PaymentResultPage';
import { CatalogPage } from './pages/CatalogPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { DeliveryPaymentPage } from './pages/DeliveryPaymentPage';
import { LoginPage } from './pages/LoginPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { WelcomePage } from './pages/WelcomePage';
import { RouteSeo } from './components/Seo';
import { ContactsPage } from './pages/ContactsPage';

export function App() {
  return (
    <>
      <RouteSeo />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:slug" element={<CandlePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/payment/result" element={<PaymentResultPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/delivery-payment" element={<DeliveryPaymentPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/orders/track" element={<OrderTrackingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/verify-email" element={<Navigate to="/" replace />} />
          <Route path="/account" element={<Navigate to="/admin" replace />} />
          <Route path="/favorites" element={<Navigate to="/catalog" replace />} />
          <Route path="/admin/candles" element={<AdminCandlesPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/content" element={<AdminContentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
