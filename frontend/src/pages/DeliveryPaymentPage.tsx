import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSiteContent } from '../api/contentApi';
import { defaultSiteContent, type SiteContent } from '../types/siteContent';
import { updateAdminContent } from '../api/adminApi';
import { InlineTextEditor } from '../components/InlineContentEditor';

export function DeliveryPaymentPage() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);

  useEffect(() => {
    getSiteContent().then(setContent).catch(() => undefined);
  }, []);

  async function saveField(key: keyof SiteContent, value: string) {
    const saved = await updateAdminContent({ [key]: value });
    setContent((current) => ({ ...current, ...saved }));
  }

  const options = [1, 2, 3].map((number) => ({
    titleKey: `delivery.option${number}Title` as keyof SiteContent,
    textKey: `delivery.option${number}Text` as keyof SiteContent,
    termKey: `delivery.option${number}Term` as keyof SiteContent,
    noteKey: `delivery.option${number}Note` as keyof SiteContent,
    title: content[`delivery.option${number}Title` as keyof SiteContent],
    text: content[`delivery.option${number}Text` as keyof SiteContent],
    term: content[`delivery.option${number}Term` as keyof SiteContent],
    note: content[`delivery.option${number}Note` as keyof SiteContent],
  }));

  return (
    <section className="delivery-page">
      <div className="section-heading">
        <div>
          <InlineTextEditor as="p" className="eyebrow" value={content['delivery.eyebrow']} label="Надпись над заголовком" onSave={(value) => saveField('delivery.eyebrow', value)} />
          <InlineTextEditor as="h1" value={content['delivery.title']} label="Заголовок страницы" onSave={(value) => saveField('delivery.title', value)} />
        </div>
        <Link to="/catalog">Перейти в каталог</Link>
      </div>

      <div className="delivery-options">
        {options.map((option, index) => (
          <article className="delivery-option" key={index}>
            <InlineTextEditor as="h2" value={option.title} label={`Заголовок способа доставки ${index + 1}`} onSave={(value) => saveField(option.titleKey, value)} />
            <InlineTextEditor as="p" value={option.text} label={`Описание способа доставки ${index + 1}`} multiline onSave={(value) => saveField(option.textKey, value)} />
            <InlineTextEditor as="strong" value={option.term} label={`Срок доставки ${index + 1}`} onSave={(value) => saveField(option.termKey, value)} />
            <InlineTextEditor as="span" value={option.note} label={`Примечание ${index + 1}`} multiline onSave={(value) => saveField(option.noteKey, value)} />
          </article>
        ))}
      </div>

      <div className="payment-info">
        <InlineTextEditor as="p" className="eyebrow" value={content['delivery.paymentEyebrow']} label="Надпись над оплатой" onSave={(value) => saveField('delivery.paymentEyebrow', value)} />
        <InlineTextEditor as="h2" value={content['delivery.paymentTitle']} label="Заголовок оплаты" onSave={(value) => saveField('delivery.paymentTitle', value)} />
        <InlineTextEditor as="p" value={content['delivery.paymentText']} label="Описание оплаты" multiline onSave={(value) => saveField('delivery.paymentText', value)} />
      </div>
    </section>
  );
}
