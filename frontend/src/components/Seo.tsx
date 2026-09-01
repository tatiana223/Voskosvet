import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://voskosvet.ru';
const DEFAULT_TITLE = 'ВоскоСвет — натуральные свечи из пчелиного воска';
const DEFAULT_DESCRIPTION = 'Свечи ручной работы из натурального пчелиного воска с доставкой по России.';

type SeoProps = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
};

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path,
  image = '/images/hero-beeswax-v2.png',
  noIndex = false,
  structuredData,
}: SeoProps) {
  const location = useLocation();
  const canonicalUrl = new URL(path ?? location.pathname, SITE_URL).toString();
  const imageUrl = new URL(image, SITE_URL).toString();

  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:type"]', 'property', 'og:type', structuredData ? 'product' : 'website');
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    document.getElementById('seo-structured-data')?.remove();
    if (structuredData) {
      const script = document.createElement('script');
      script.id = 'seo-structured-data';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => document.getElementById('seo-structured-data')?.remove();
  }, [canonicalUrl, description, imageUrl, noIndex, structuredData, title]);

  return null;
}

export function RouteSeo() {
  const { pathname } = useLocation();
  const privatePage = /^\/(admin|cart|checkout|login|account|payment|orders)(\/|$)/.test(pathname);
  const pages: Record<string, { title: string; description: string }> = {
    '/': {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    },
    '/catalog': {
      title: 'Каталог свечей из пчелиного воска — ВоскоСвет',
      description: 'Каталог натуральных свечей ручной работы из пчелиного воска. Выберите форму, аромат и размер с доставкой по России.',
    },
    '/delivery-payment': {
      title: 'Доставка и оплата — ВоскоСвет',
      description: 'Условия оплаты и доставки натуральных свечей ВоскоСвет по России.',
    },
    '/reviews': {
      title: 'Отзывы покупателей — ВоскоСвет',
      description: 'Отзывы покупателей о натуральных свечах ручной работы ВоскоСвет.',
    },
    '/contacts': { title: 'Контакты и реквизиты — ВоскоСвет', description: 'Контактная информация и реквизиты мастерской ВоскоСвет.' },
  };
  const page = pages[pathname];

  if (pathname.startsWith('/catalog/') && pathname !== '/catalog/') return null;
  return <Seo title={page?.title} description={page?.description} noIndex={privatePage || !page} />;
}
