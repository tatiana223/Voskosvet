import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSiteContent } from '../api/contentApi';
import { defaultSiteContent, type SiteContent } from '../types/siteContent';
import { updateAdminContent } from '../api/adminApi';
import { InlineTextEditor } from '../components/InlineContentEditor';
import { getStoredAuth } from '../utils/auth';
import {
  getDeliveryOptions,
  serializeDeliveryOptions,
  type DeliveryOption,
} from '../utils/deliveryOptions';

export function DeliveryPaymentPage() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const isAdmin = getStoredAuth()?.role === 'ADMIN';
  const options = getDeliveryOptions(content);

  useEffect(() => {
    getSiteContent().then(setContent).catch(() => undefined);
  }, []);

  async function saveField(key: keyof SiteContent, value: string) {
    const saved = await updateAdminContent({ [key]: value });
    setContent((current) => ({ ...current, ...saved }));
  }

  async function saveOptions(nextOptions: DeliveryOption[]) {
    await saveField('delivery.options', serializeDeliveryOptions(nextOptions));
  }

  async function updateOption(index: number, field: keyof Omit<DeliveryOption, 'id'>, value: string) {
    const nextOptions = options.map((option, optionIndex) => (
      optionIndex === index ? { ...option, [field]: value } : option
    ));
    await saveOptions(nextOptions);
  }

  async function addOption() {
    await saveOptions([
      ...options,
      {
        id: crypto.randomUUID(),
        title: 'Новый способ доставки',
        text: 'Добавьте описание доставки.',
        term: 'Укажите срок доставки',
        note: 'Добавьте примечание.',
      },
    ]);
  }

  async function removeOption(index: number) {
    if (!window.confirm('Удалить этот способ доставки?')) return;
    await saveOptions(options.filter((_, optionIndex) => optionIndex !== index));
  }

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
          <article className="delivery-option" key={option.id}>
            {isAdmin ? (
              <button className="delivery-remove-button" type="button" onClick={() => void removeOption(index)}>
                Удалить раздел
              </button>
            ) : null}
            <InlineTextEditor as="h2" value={option.title} label={`Название доставки ${index + 1}`} onSave={(value) => updateOption(index, 'title', value)} />
            <InlineTextEditor as="p" value={option.text} label={`Описание доставки ${index + 1}`} multiline onSave={(value) => updateOption(index, 'text', value)} />
            <InlineTextEditor as="strong" value={option.term} label={`Срок доставки ${index + 1}`} onSave={(value) => updateOption(index, 'term', value)} />
            <InlineTextEditor as="span" value={option.note} label={`Примечание ${index + 1}`} multiline onSave={(value) => updateOption(index, 'note', value)} />
          </article>
        ))}
      </div>

      {isAdmin ? (
        <button className="delivery-add-button" type="button" onClick={() => void addOption()}>
          + Добавить способ доставки
        </button>
      ) : null}

      <div className="payment-info">
        <InlineTextEditor as="p" className="eyebrow" value={content['delivery.paymentEyebrow']} label="Надпись над оплатой" onSave={(value) => saveField('delivery.paymentEyebrow', value)} />
        <InlineTextEditor as="h2" value={content['delivery.paymentTitle']} label="Заголовок оплаты" onSave={(value) => saveField('delivery.paymentTitle', value)} />
        <InlineTextEditor as="p" value={content['delivery.paymentText']} label="Описание оплаты" multiline onSave={(value) => saveField('delivery.paymentText', value)} />
      </div>

      <section className="returns-info">
        <p className="eyebrow">Покупателям</p>
        <InlineTextEditor as="h2" value={content['delivery.returnsTitle']} label="Заголовок возврата" onSave={(value) => saveField('delivery.returnsTitle', value)} />
        <InlineTextEditor as="p" value={content['delivery.returnsText']} label="Описание возврата" multiline onSave={(value) => saveField('delivery.returnsText', value)} />
        <InlineTextEditor as="p" value={content['delivery.returnsConditions']} label="Условия возврата" multiline onSave={(value) => saveField('delivery.returnsConditions', value)} />
        <Link to="/contacts">Связаться с нами</Link>
      </section>
    </section>
  );
}
