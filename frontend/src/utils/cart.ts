import type { Candle } from '../types/candle';
import { getStoredAuth } from './auth';

export type CartItem = {
  candle: Candle;
  quantity: number;
};

const CART_KEY_PREFIX = 'voskosvet-cart';
const CART_EVENT = 'voskosvet-cart-change';

function getCartKey() {
  const auth = getStoredAuth();
  return auth ? `${CART_KEY_PREFIX}-${auth.id}` : null;
}

function readCart(): CartItem[] {
  const cartKey = getCartKey();

  if (!cartKey) {
    return [];
  }

  const rawCart = localStorage.getItem(cartKey);

  if (!rawCart) {
    return [];
  }

  try {
    return JSON.parse(rawCart) as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  const cartKey = getCartKey();

  if (!cartKey) {
    return;
  }

  localStorage.setItem(cartKey, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function getCartItems() {
  return readCart();
}

export function subscribeToCart(listener: () => void) {
  window.addEventListener(CART_EVENT, listener);
  window.addEventListener('storage', listener);

  return () => {
    window.removeEventListener(CART_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

export function addToCart(candle: Candle, quantity = 1) {
  const items = readCart();
  const existingItem = items.find((item) => item.candle.id === candle.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    items.push({ candle, quantity });
  }

  writeCart(items);
}

export function updateCartItemQuantity(candleId: number, quantity: number) {
  const items = readCart()
    .map((item) => (item.candle.id === candleId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  writeCart(items);
}

export function removeFromCart(candleId: number) {
  writeCart(readCart().filter((item) => item.candle.id !== candleId));
}

export function clearCart() {
  writeCart([]);
}

export function getCartItemsCount(items = readCart()) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(items = readCart()) {
  return items.reduce((sum, item) => sum + item.candle.price * item.quantity, 0);
}
