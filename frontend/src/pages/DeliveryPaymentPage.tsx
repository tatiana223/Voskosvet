import { Link } from 'react-router-dom';

export function DeliveryPaymentPage() {
  return (
    <section className="delivery-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Покупателям</p>
          <h1>Доставка и оплата</h1>
        </div>

        <Link to="/catalog">Перейти в каталог</Link>
      </div>

      <div className="delivery-options">
        <article className="delivery-option">
          <h2>СДЭК</h2>
          <p>Доставка до удобного пункта выдачи по всей России.</p>
          <strong>Срок: 2–7 рабочих дней</strong>
          <span>Стоимость рассчитывается при оформлении заказа.</span>
        </article>

        <article className="delivery-option">
          <h2>Курьерская доставка</h2>
          <p>Курьер доставит заказ по указанному адресу.</p>
          <strong>Срок: 2–7 рабочих дней</strong>
          <span>Перед приездом курьер свяжется с вами.</span>
        </article>

        <article className="delivery-option">
          <h2>Почта России</h2>
          <p>Доставка в населённые пункты, где нет пунктов СДЭК.</p>
          <strong>Срок: 5–14 рабочих дней</strong>
          <span>Стоимость зависит от региона и веса заказа.</span>
        </article>
      </div>

      <div className="payment-info">
        <p className="eyebrow">Оплата</p>
        <h2>Как можно оплатить заказ</h2>
        <p>
          Заказ можно оплатить банковской картой онлайн. Полную стоимость,
          включая доставку, вы увидите перед подтверждением заказа. ??????????
        </p>
      </div>
    </section>
  );
}