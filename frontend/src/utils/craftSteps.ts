export type CraftStep = {
  id: string;
  number: string;
  title: string;
  text: string;
  videoUrl: string;
  posterUrl: string;
};

export const defaultCraftSteps: CraftStep[] = [
  { id: 'wax', number: '01', title: 'Выбираем воск', text: 'Берём натуральный пчелиный воск с тёплым медовым ароматом и бережно очищаем его.', videoUrl: '', posterUrl: '/images/about-natural-candle.webp' },
  { id: 'wick', number: '02', title: 'Готовим фитиль', text: 'Подбираем хлопковый фитиль под диаметр свечи, чтобы пламя было спокойным и ровным.', videoUrl: '', posterUrl: '/images/candle-detail.webp' },
  { id: 'shape', number: '03', title: 'Создаём форму', text: 'Работаем небольшими партиями и внимательно следим за каждой деталью поверхности.', videoUrl: '', posterUrl: '/images/candle-size.webp' },
  { id: 'pack', number: '04', title: 'Проверяем и упаковываем', text: 'Каждую свечу осматриваем вручную и бережно упаковываем перед отправкой.', videoUrl: '', posterUrl: '/images/gift-box.webp' },
];

export function getCraftSteps(value: string): CraftStep[] {
  if (!value) return defaultCraftSteps;
  try {
    const parsed = JSON.parse(value) as CraftStep[];
    return Array.isArray(parsed) && parsed.length ? parsed : defaultCraftSteps;
  } catch {
    return defaultCraftSteps;
  }
}

export function serializeCraftSteps(steps: CraftStep[]) {
  return JSON.stringify(steps);
}
