import { normalizeMarketerSlug, slugifyMarketer } from '@/lib/marketer-utils';

export type CampaignLinkType = 'whatsapp' | 'maps' | 'project' | 'url';

export const CAMPAIGN_LINK_TYPES: CampaignLinkType[] = [
  'whatsapp',
  'maps',
  'project',
  'url',
];

export function slugifyCampaignLanding(name: string): string {
  return normalizeMarketerSlug(slugifyMarketer(name));
}

export function normalizeCampaignSlug(input: string): string {
  return normalizeMarketerSlug(input);
}

export function buildCampaignLandingUrl(origin: string, slug: string): string {
  return `${origin.replace(/\/$/, '')}/l/${normalizeCampaignSlug(slug)}`;
}

export function buildCampaignLinkGoUrl(
  origin: string,
  landingSlug: string,
  linkId: number,
): string {
  return `${origin.replace(/\/$/, '')}/l/${normalizeCampaignSlug(landingSlug)}/go/${linkId}`;
}

export function resolveCampaignLinkDestination(
  link: { type: string; url: string; projectId: number | null },
  siteOrigin: string,
): string {
  switch (link.type as CampaignLinkType) {
    case 'whatsapp': {
      const digits = link.url.replace(/\D/g, '');
      return digits ? `https://wa.me/${digits}` : '#';
    }
    case 'maps':
      return link.url.trim() || '#';
    case 'project':
      return link.projectId ? `${siteOrigin}/projects/${link.projectId}` : '#';
    case 'url':
      return link.url.trim() || '#';
    default:
      return link.url.trim() || '#';
  }
}

export function campaignLinkTypeLabel(type: string, lang: 'ar' | 'en' = 'ar'): string {
  const labels: Record<CampaignLinkType, { ar: string; en: string }> = {
    whatsapp: { ar: 'واتساب', en: 'WhatsApp' },
    maps: { ar: 'Google Maps', en: 'Google Maps' },
    project: { ar: 'مشروع', en: 'Project' },
    url: { ar: 'رابط', en: 'Link' },
  };
  return labels[type as CampaignLinkType]?.[lang] ?? type;
}

export type CampaignLinkInput = {
  id?: number;
  type: CampaignLinkType;
  titleAr: string;
  titleEn: string;
  url?: string;
  projectId?: number | null;
  sortOrder?: number;
  enabled?: boolean;
};

export function normalizeCampaignLinkInput(raw: CampaignLinkInput, index: number) {
  const type = CAMPAIGN_LINK_TYPES.includes(raw.type) ? raw.type : 'url';
  let url = String(raw.url ?? '').trim();
  let projectId: number | null = null;

  if (type === 'whatsapp') {
    url = url.replace(/\D/g, '');
  } else if (type === 'project') {
    const pid = Number(raw.projectId);
    projectId = Number.isFinite(pid) && pid > 0 ? pid : null;
    url = '';
  }

  return {
    type,
    titleAr: String(raw.titleAr ?? '').trim() || campaignLinkTypeLabel(type, 'ar'),
    titleEn: String(raw.titleEn ?? '').trim() || campaignLinkTypeLabel(type, 'en'),
    url,
    projectId,
    sortOrder: raw.sortOrder ?? index,
    enabled: raw.enabled !== false,
  };
}
