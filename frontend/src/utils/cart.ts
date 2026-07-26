import type { Candle } from '../types/candle';
import { getStoredAuth } from './auth';

export type CartItem = {
  candle: Candle;
  quantity: number;
};

export function getCandleUnitPrice(candle: Candle, quantity: number) {
  return (candle.priceTiers || [])
    .find((tier) => tier.quantity === quantity)?.unitPrice ?? candle.price;
}

export function getCandleSavingPercent(candle: Candle, unitPrice: number) {
  const referencePrice = candle.priceTiers?.[0]?.unitPrice ?? candle.price;
  if (referencePrice <= 0 || unitPrice >= referencePrice) return 0;
  return Math.round((1 - unitPrice / referencePrice) * 100);
}

export function getDefaultPurchaseQuantity(candle: Candle) {
  return candle.priceTiers?.[0]?.quantity ?? 1;
}

const CART_KEY_PREFIX = 'voskosvet-cart';
const GUEST_CART_KEY = `${CART_KEY_PREFIX}-guest`;
const CART_EVENT = 'voskosvet-cart-change';

function getCartKey() {
  const auth = getStoredAuth();
  return auth ? `${CART_KEY_PREFIX}-${auth.id}` : GUEST_CART_KEY;
}

function readCart(): CartItem[] {
  const cartKey = getCartKey();
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
  localStorage.setItem(cartKey, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function mergeGuestCartIntoAccount() {
  const auth = getStoredAuth();

  if (!auth) {
    return;
  }

  const rawGuestCart = localStorage.getItem(GUEST_CART_KEY);

  if (!rawGuestCart) {
    return;
  }

  try {
    const guestItems = JSON.parse(rawGuestCart) as CartItem[];
    const accountKey = `${CART_KEY_PREFIX}-${auth.id}`;
    const rawAccountCart = localStorage.getItem(accountKey);
    const accountItems = rawAccountCart ? JSON.parse(rawAccountCart) as CartItem[] : [];

    guestItems.forEach((guestItem) => {
      const existingItem = accountItems.find(
        (item) => item.candle.id === guestItem.candle.id,
      );

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        accountItems.push(guestItem);
      }
    });

    localStorage.setItem(accountKey, JSON.stringify(accountItems));
    localStorage.removeItem(GUEST_CART_KEY);
    window.dispatchEvent(new Event(CART_EVENT));
  } catch {
    localStorage.removeItem(GUEST_CART_KEY);
  }
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
    existingItem.candle = candle;
    existingItem.quantity = (candle.priceTiers || []).length > 0
      ? quantity
      : existingItem.quantity + quantity;
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
  return items.reduce(
    (sum, item) => sum + getCandleUnitPrice(item.candle, item.quantity) * item.quantity,
    0,
  );
}
