export type DeliveryMethod = 'PICKUP' | 'COURIER' | 'CDEK' | 'POST';
export type PaymentMethod = 'CASH' | 'CARD_ONLINE' | 'TRANSFER';
export type ContactMethod = 'PHONE' | 'WHATSAPP' | 'TELEGRAM' | 'EMAIL';

export type CreateOrderItemRequest = {
  candleId: number;
  quantity: number;
};

export type CreateOrderRequest = {
  customerFullName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryMethod: DeliveryMethod;
  deliveryPrice?: number;
  city?: string;
  deliveryAddress?: string;
  deliveryComment?: string;
  preferredContactMethod?: ContactMethod;
  paymentMethod: PaymentMethod;
  comment?: string;
  items: CreateOrderItemRequest[];
};

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderItemResponse = {
  id: number;
  candleId: number;
  candleName: string;
  quantity: number;
  priceAtPurchase: number;
  subtotal: number;
};

export type OrderResponse = {
  id: number;
  createdAt: string;
  status: OrderStatus;
  totalPrice: number;
  itemsPrice: number;
  deliveryPrice: number;
  deliveryMethod: DeliveryMethod;
  city?: string;
  deliveryAddress?: string;
  deliveryComment?: string;
  contactEmail?: string;
  preferredContactMethod?: ContactMethod;
  paymentMethod: PaymentMethod;
  comment?: string;
  customer: {
    id: number;
    fullName: string;
    phone: string;
    email?: string;
  };
  items: OrderItemResponse[];
};
