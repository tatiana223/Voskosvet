import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSiteContent } from '../api/contentApi';
import { defaultSiteContent, type SiteContent } from '../types/siteContent';

export function DeliveryPaymentPage() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);

  useEffect(() => {
    getSiteContent().then(setContent).catch(() => undefined);
  }, []);

  const options = [1, 2, 3].map((number) => ({
    title: content[`delivery.option${number}Title` as keyof SiteContent],
    text: content[`delivery.option${number}Text` as keyof SiteContent],
    term: content[`delivery.option${number}Term` as keyof SiteContent],
    note: content[`delivery.option${number}Note` as keyof SiteContent],
  }));

  return (
    <section className="delivery-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{content['delivery.eyebrow']}</p>
          <h1>{content['delivery.title']}</h1>
        </div>
        <Link to="/catalog">Перейти в каталог</Link>
      </div>

      <div className="delivery-options">
        {options.map((option, index) => (
          <article className="delivery-option" key={index}>
            <h2>{option.title}</h2>
            <p>{option.text}</p>
            <strong>{option.term}</strong>
            <span>{option.note}</span>
          </article>
        ))}
      </div>

      <div className="payment-info">
        <p className="eyebrow">{content['delivery.paymentEyebrow']}</p>
        <h2>{content['delivery.paymentTitle']}</h2>
        <p>{content['delivery.paymentText']}</p>
      </div>
    </section>
  );
}
