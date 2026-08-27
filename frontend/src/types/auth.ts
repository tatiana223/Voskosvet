export type Role = 'USER' | 'MANAGER' | 'ADMIN';

export type AuthResponse = {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  city?: string;
  deliveryAddress?: string;
  preferredContactMethod?: 'PHONE' | 'WHATSAPP' | 'TELEGRAM' | 'MAX' | 'EMAIL';
  defaultDeliveryMethod?: 'PICKUP' | 'COURIER' | 'CDEK' | 'POST';
  defaultPaymentMethod?: 'CASH' | 'CARD_ONLINE' | 'TRANSFER';
  role: Role;
  token: string | null;
};

export type UpdateProfileRequest = {
  fullName: string;
  phone: string;
  email: string;
  city?: string;
  deliveryAddress?: string;
  preferredContactMethod: 'PHONE' | 'WHATSAPP' | 'TELEGRAM' | 'MAX' | 'EMAIL';
  defaultDeliveryMethod: 'PICKUP' | 'COURIER' | 'CDEK' | 'POST';
  defaultPaymentMethod: 'CASH' | 'CARD_ONLINE' | 'TRANSFER';
};

export type RegisterRequest = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type MessageResponse = {
  message: string;
};
