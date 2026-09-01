import { useEffect, useState } from 'react';
import { getSiteContent } from '../api/contentApi';
import { Seo } from '../components/Seo';
import { defaultSiteContent, type SiteContent } from '../types/siteContent';

export function ContactsPage() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  useEffect(() => { getSiteContent().then((saved) => setContent({ ...defaultSiteContent, ...saved })).catch(() => undefined); }, []);
  const rows = [
    ['Телефон', content['contacts.phone']], ['Электронная почта', content['contacts.email']],
    ['Адрес', content['contacts.address']], ['Наименование', content['contacts.legalName']],
    ['ИНН', content['contacts.inn']], ['ОГРН / ОГРНИП', content['contacts.ogrn']],
  ].filter(([, value]) => value);

  return <>
    <Seo title="Контакты и реквизиты — ВоскоСвет" description={content['contacts.intro']} path="/contacts" />
    <section className="contacts-page">
      <header><p className="eyebrow">{content['contacts.eyebrow']}</p><h1>{content['contacts.title']}</h1><p>{content['contacts.intro']}</p></header>
      <dl>{rows.length ? rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>) : <div><dt>Данные готовятся</dt><dd>Контактные данные можно заполнить в панели администратора.</dd></div>}</dl>
    </section>
  </>;
}
