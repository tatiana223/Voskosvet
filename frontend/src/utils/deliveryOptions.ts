import type { SiteContent } from '../types/siteContent';

export type DeliveryOption = {
  id: string;
  title: string;
  text: string;
  term: string;
  note: string;
};

export function getDeliveryOptions(content: SiteContent): DeliveryOption[] {
  const saved = content['delivery.options'];

  if (saved) {
    try {
      const parsed = JSON.parse(saved) as DeliveryOption[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Старые настройки ниже остаются запасным вариантом.
    }
  }

  return [1, 2, 3].map((number) => ({
    id: `legacy-${number}`,
    title: content[`delivery.option${number}Title` as keyof SiteContent],
    text: content[`delivery.option${number}Text` as keyof SiteContent],
    term: content[`delivery.option${number}Term` as keyof SiteContent],
    note: content[`delivery.option${number}Note` as keyof SiteContent],
  }));
}

export function serializeDeliveryOptions(options: DeliveryOption[]) {
  return JSON.stringify(options);
}
