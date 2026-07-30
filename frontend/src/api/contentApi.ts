import type { SiteContent } from '../types/siteContent';
import { defaultSiteContent } from '../types/siteContent';
import { apiRequest } from './http';

export async function getSiteContent(): Promise<SiteContent> {
  const saved = await apiRequest<Partial<SiteContent>>('/api/content');
  return { ...defaultSiteContent, ...saved };
}
