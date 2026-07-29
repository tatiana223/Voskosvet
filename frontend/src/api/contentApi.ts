import type { SiteContent } from '../types/siteContent';
import { defaultSiteContent } from '../types/siteContent';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export async function getSiteContent(): Promise<SiteContent> {
  const response = await fetch(`${API_BASE_URL}/api/content`);
  if (!response.ok) return defaultSiteContent;

  const saved = await response.json() as Partial<SiteContent>;
  return { ...defaultSiteContent, ...saved };
}
