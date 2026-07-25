export type Role = 'USER' | 'MANAGER' | 'ADMIN';

export type AuthResponse = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  token: string | null;
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
