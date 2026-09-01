import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT || 80);
const publicDir = new URL('./dist/', import.meta.url);
const backendUrl = process.env.BACKEND_URL || 'http://backend:8080';
const siteUrl = 'https://voskosvet.ru';
const template = await readFile(new URL('./dist/index.html', import.meta.url), 'utf8');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const staticPages = {
  '/': {
    title: 'ВоскоСвет — натуральные свечи из пчелиного воска',
    description: 'Свечи ручной работы из натурального пчелиного воска с доставкой по России.',
    content: '<main><h1>Натуральные свечи из пчелиного воска</h1><p>Свечи ВоскоСвет изготавливаются вручную из натурального пчелиного воска. Доставка по России.</p><p><a href="/catalog">Перейти в каталог свечей</a></p></main>',
  },
  '/delivery-payment': {
    title: 'Доставка и оплата — ВоскоСвет',
    description: 'Условия оплаты и доставки натуральных свечей ВоскоСвет по России.',
    content: '<main><h1>Доставка и оплата</h1><p>Информация об оплате и доставке свечей ВоскоСвет по России.</p></main>',
  },
  '/reviews': {
    title: 'Отзывы покупателей — ВоскоСвет',
    description: 'Отзывы покупателей о натуральных свечах ручной работы ВоскоСвет.',
    content: '<main><h1>Отзывы покупателей</h1><p>Отзывы о натуральных свечах ручной работы ВоскоСвет.</p></main>',
  },
  '/about': {
    title: 'О мастерской ВоскоСвет — свечи ручной работы',
    description: 'История и ценности мастерской натуральных свечей из пчелиного воска ВоскоСвет.',
    content: '<main><h1>О мастерской ВоскоСвет</h1><p>Свечи ручной работы из натурального пчелиного воска.</p><p><a href="/craft">Посмотреть, как создаются свечи</a></p></main>',
  },
  '/craft': {
    title: 'Как создаются свечи из пчелиного воска — ВоскоСвет',
    description: 'Видеоархив мастерской, путь создания свечи, преимущества пчелиного воска и правила безопасного использования.',
    content: '<main><h1>Путь свечи: от воска до огня</h1><p>Видео и подробный рассказ о том, как в мастерской ВоскоСвет создаются натуральные восковые свечи.</p><h2>Почему пчелиный воск</h2><p>Натуральный материал с естественным медовым ароматом и тёплым оттенком.</p><h2>Как правильно жечь свечу</h2><p>Подрежьте фитиль до 5–7 мм и используйте устойчивый негорючий подсвечник.</p></main>',
  },
  '/contacts': {
    title: 'Контакты и реквизиты — ВоскоСвет',
    description: 'Контактная информация и реквизиты мастерской натуральных свечей ВоскоСвет.',
    content: '<main><h1>Контакты и реквизиты</h1><p>Свяжитесь с мастерской ВоскоСвет по вопросам заказов и сотрудничества.</p></main>',
  },
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function absoluteImage(image) {
  if (!image) return `${siteUrl}/images/hero-natural-candle.webp`;
  try {
    const url = new URL(image, siteUrl);
    if (url.hostname === 'backend' || url.hostname === 'localhost') {
      return new URL(`${url.pathname}${url.search}`, siteUrl).toString();
    }
    return url.toString();
  } catch {
    return `${siteUrl}/images/hero-natural-candle.webp`;
  }
}

function renderHtml({ title, description, path, image, content, robots = 'index, follow', structuredData }) {
  const canonical = new URL(path, siteUrl).toString();
  const tags = [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${absoluteImage(image)}" />`,
    structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData).replaceAll('<', '\\u003c')}</script>` : '',
  ].join('\n    ');

  return template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace(/\s*<meta name="description"[^>]*>/, '')
    .replace(/\s*<meta name="robots"[^>]*>/, '')
    .replace(/\s*<link rel="canonical"[^>]*>/, '')
    .replace('</head>', `    ${tags}\n  </head>`)
    .replace('<div id="app"></div>', `<div id="app">${content}</div>`);
}

async function fetchJson(path) {
  const response = await fetch(`${backendUrl}${path}`, { signal: AbortSignal.timeout(4000) });
  if (!response.ok) throw new Error(`Backend returned ${response.status}`);
  return response.json();
}

async function renderProduct(slug) {
  const candle = await fetchJson(`/api/candles/slug/${encodeURIComponent(slug)}`);
  const description = candle.seoDescription || candle.shortDescription || candle.description || `Свеча ${candle.name} ручной работы из натурального пчелиного воска.`;
  const images = [candle.imageUrl, ...(candle.imageUrls || [])].filter(Boolean).map(absoluteImage);
  const productPath = `/catalog/${encodeURIComponent(candle.slug)}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: candle.name,
    description,
    image: images,
    sku: `candle-${candle.id}`,
    brand: { '@type': 'Brand', name: 'ВоскоСвет' },
    material: candle.material || 'Натуральный пчелиный воск',
    color: candle.color,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}${productPath}`,
      priceCurrency: 'RUB',
      price: candle.price,
      availability: candle.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };
  const specs = [
    ['Аромат', candle.scent],
    ['Цвет', candle.color],
    ['Размер', candle.size],
    ['Вес', candle.weightGrams ? `${candle.weightGrams} г` : ''],
    ['Время горения', candle.burnTimeHours ? `${candle.burnTimeHours} ч` : ''],
    ['Материал', candle.material],
    ['Фитиль', candle.wickType],
  ].filter(([, value]) => value).map(([name, value]) => `<dt>${escapeHtml(name)}</dt><dd>${escapeHtml(value)}</dd>`).join('');
  const mainImageAlt = candle.imageAlts?.[candle.imageUrl] || `${candle.name} — свеча из натурального пчелиного воска`;
  const usage = candle.usageInstructions ? `<h2>Рекомендации по использованию</h2><p>${escapeHtml(candle.usageInstructions)}</p>` : '';
  const content = `<main><article><p><a href="/catalog">Каталог свечей</a></p><h1>${escapeHtml(candle.name)}</h1><p>${escapeHtml(description)}</p><img src="${images[0] || absoluteImage()}" alt="${escapeHtml(mainImageAlt)}"><dl>${specs}</dl>${usage}<p><strong>${escapeHtml(candle.price)} ₽</strong></p><p>${candle.available ? 'В наличии' : 'Нет в наличии'}</p></article></main>`;

  return renderHtml({
    title: candle.seoTitle || `${candle.name} — купить свечу из пчелиного воска | ВоскоСвет`,
    description,
    path: productPath,
    image: images[0],
    content,
    structuredData,
  });
}

async function renderCatalog() {
  const page = await fetchJson('/api/candles?page=0&size=100&sort=createdAt,desc');
  const products = page.items.map((candle) => `<li><a href="/catalog/${encodeURIComponent(candle.slug)}">${escapeHtml(candle.name)}</a> — ${escapeHtml(candle.price)} ₽</li>`).join('');
  return renderHtml({
    title: 'Каталог свечей из пчелиного воска — ВоскоСвет',
    description: 'Каталог натуральных свечей ручной работы из пчелиного воска. Выберите форму, аромат и размер с доставкой по России.',
    path: '/catalog',
    content: `<main><h1>Каталог свечей из пчелиного воска</h1><ul>${products}</ul></main>`,
  });
}

async function serveStatic(pathname, response) {
  const relativePath = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  const fileUrl = new URL(relativePath, publicDir);
  if (!fileUrl.href.startsWith(publicDir.href)) return false;
  try {
    const fileInfo = await stat(fileUrl);
    if (!fileInfo.isFile()) return false;
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(relativePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': relativePath.startsWith('assets/') ? 'public, max-age=604800, immutable' : 'public, max-age=3600',
    });
    response.end(await readFile(fileUrl));
    return true;
  } catch {
    return false;
  }
}

createServer(async (request, response) => {
  const url = new URL(request.url || '/', siteUrl);
  if (url.pathname.includes('.') && await serveStatic(url.pathname, response)) return;

  try {
    let html;
    if (url.pathname === '/catalog') {
      html = await renderCatalog();
    } else if (/^\/catalog\/[^/]+$/.test(url.pathname)) {
      html = await renderProduct(decodeURIComponent(url.pathname.split('/').pop()));
    } else if (staticPages[url.pathname]) {
      html = renderHtml({ ...staticPages[url.pathname], path: url.pathname });
    } else {
      html = renderHtml({
        title: 'ВоскоСвет',
        description: 'Интернет-магазин натуральных свечей ВоскоСвет.',
        path: url.pathname,
        robots: 'noindex, nofollow',
        content: '<main><p>Загрузка страницы…</p></main>',
      });
    }
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    response.end(html);
  } catch (error) {
    console.error('SEO render failed:', error);
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    response.end(template);
  }
}).listen(port, '0.0.0.0', () => console.log(`Frontend renderer listening on ${port}`));
