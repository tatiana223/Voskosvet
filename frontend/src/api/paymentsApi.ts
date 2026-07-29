import { apiRequest } from './http';

export type PaymentStatus = 'NOT_REQUIRED' | 'PENDING' | 'SUCCEEDED' | 'CANCELED';

export type PaymentResponse = {
  orderId: number;
  status: PaymentStatus;
  confirmationUrl?: string;
};

export function getPaymentConfig() {
  return apiRequest<{ enabled: boolean }>('/api/payments/config');
}

export function startOnlinePayment(orderId: number, phone: string) {
  return apiRequest<PaymentResponse>(`/api/payments/orders/${orderId}`, {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function getOnlinePaymentStatus(orderId: number, phone: string) {
  const params = new URLSearchParams({ phone });
  return apiRequest<PaymentResponse>(`/api/payments/orders/${orderId}?${params}`);
}
