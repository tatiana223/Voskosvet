import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getOnlinePaymentStatus, type PaymentStatus } from '../api/paymentsApi';

const statusCopy: Record<PaymentStatus, { title: string; text: string }> = {
  SUCCEEDED: {
    title: 'Оплата прошла',
    text: 'Заказ оплачен и передан магазину в обработку.',
  },
  PENDING: {
    title: 'Проверяем оплату',
    text: 'Подтверждение ещё обрабатывается. Обычно это занимает несколько секунд.',
  },
  CANCELED: {
    title: 'Оплата не завершена',
    text: 'Платёж отменён. Вы сможете повторить оплату заказа.',
  },
  NOT_REQUIRED: {
    title: 'Онлайн-оплата не требуется',
    text: 'Для этого заказа выбран другой способ оплаты.',
  },
};

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const orderId = Number(params.get('orderId'));
  const [status, setStatus] = useState<PaymentStatus>('PENDING');
  const [error, setError] = useState('');

  useEffect(() => {
    const phone = sessionStorage.getItem(`voskosvet-payment-phone-${orderId}`);
    if (!orderId || !phone) {
      setError('Не удалось проверить заказ в этом браузере.');
      return;
    }

    let attempts = 0;
    const check = () => {
      getOnlinePaymentStatus(orderId, phone)
        .then((result) => {
          setStatus(result.status);
          if (result.status === 'PENDING' && attempts < 8) {
            attempts += 1;
            window.setTimeout(check, 2500);
          }
        })
        .catch(() => setError('Не удалось проверить оплату. Посмотрите заказ в личном кабинете или отслеживании.'));
    };
    check();
  }, [orderId]);

  const copy = statusCopy[status];
  return (
    <section className="payment-result-page">
      <div className={`payment-result-card payment-result-card--${status.toLowerCase()}`}>
        <span className="payment-result-icon">{status === 'SUCCEEDED' ? '✓' : status === 'CANCELED' ? '×' : '…'}</span>
        <p className="eyebrow">Заказ №{orderId || '—'}</p>
        <h1>{error ? 'Проверка оплаты' : copy.title}</h1>
        <p>{error || copy.text}</p>
        <div className="payment-result-actions">
          <Link className="primary-link" to="/orders/track">Отследить заказ</Link>
          <Link className="secondary-link" to="/catalog">Вернуться в каталог</Link>
        </div>
      </div>
    </section>
  );
}
