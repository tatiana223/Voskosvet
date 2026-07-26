import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getCartItems,
  getCartTotal,
  getCandleUnitPrice,
  removeFromCart,
  subscribeToCart,
  updateCartItemQuantity,
  type CartItem,
} from '../utils/cart';
import { getCandleImage, useCandleImageFallback } from '../utils/images';

export function CartPage() {
  const [items, setItems] = useState<CartItem[]>(getCartItems);
  const total = getCartTotal(items);

  useEffect(() => {
    return subscribeToCart(() => setItems(getCartItems()));
  }, []);

  return (
    <section className="checkout-page cart-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Ваш выбор</p>
          <h1>Корзина</h1>
        </div>
        <Link to="/catalog">Продолжить покупки</Link>
      </div>

      {items.length === 0 ? (
        <div className="cart-panel cart-page-empty">
          <h2>Корзина пока пустая</h2>
          <p>Добавьте понравившиеся свечи из каталога.</p>
          <Link className="primary-link" to="/catalog">Выбрать свечи</Link>
        </div>
      ) : (
        <div className="cart-page-layout">
          <div className="cart-panel">
            <h2>Ваши свечи</h2>
            <div className="cart-list">
              {items.map((item) => (
                <article className="cart-item" key={`${item.candle.id}-${item.packageSize}`}>
                  <img
                    src={getCandleImage(item.candle.imageUrl)}
                    alt={item.candle.name}
                    onError={useCandleImageFallback}
                  />
                  <div>
                    <h3>{item.candle.name}</h3>
                    <p>{item.candle.shortDescription || item.candle.categoryName}</p>
                    <p>{item.packageSize} свечей в коробке</p>
                    <strong>{(
                      getCandleUnitPrice(item.candle, item.packageSize) * item.packageSize
                    ).toLocaleString('ru-RU')} ₽ за коробку</strong>
                  </div>
                  <div className="cart-item-actions">
                    <label>
                      <span>Коробок</span>
                      <input
                        min="1"
                        type="number"
                        value={item.quantity}
                        onChange={(event) =>
                          updateCartItemQuantity(item.candle.id, item.packageSize, Math.max(1, Number(event.target.value)))
                        }
                      />
                    </label>
                    <button type="button" onClick={() => removeFromCart(item.candle.id, item.packageSize)}>Удалить</button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="cart-checkout-card">
            <p className="eyebrow">Итого</p>
            <strong>{total.toLocaleString('ru-RU')} ₽</strong>
            <span>{items.reduce((sum, item) => sum + item.quantity, 0)} коробок</span>
            <p>Стоимость доставки будет рассчитана при оформлении заказа.</p>
            <Link className="primary-link" to="/checkout">Перейти к оформлению</Link>
            <Link className="secondary-link" to="/catalog">Вернуться в каталог</Link>
          </aside>
        </div>
      )}
    </section>
  );
}
