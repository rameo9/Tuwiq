/** Build a URL-safe slug from a marketer name. */
export function slugifyMarketer(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (/^[a-z0-9-]+$/.test(base)) return base || 'marketer';

  const fallback = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return fallback || `marketer-${Date.now().toString(36)}`;
}

export function normalizeMarketerSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export function parseDeviceType(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();
  if (!ua) return 'unknown';
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) return 'mobile';
  if (/windows|macintosh|linux|cros/i.test(ua)) return 'desktop';
  return 'unknown';
}

export function deviceTypeLabel(type: DeviceType, lang: 'ar' | 'en' = 'ar'): string {
  const labels: Record<DeviceType, { ar: string; en: string }> = {
    mobile: { ar: 'جوال', en: 'Mobile' },
    tablet: { ar: 'تابلت', en: 'Tablet' },
    desktop: { ar: 'كمبيوتر', en: 'Desktop' },
    unknown: { ar: 'غير معروف', en: 'Unknown' },
  };
  return labels[type][lang];
}

export function countryLabel(code: string, lang: 'ar' | 'en' = 'ar'): string {
  if (!code || code === 'Unknown') return lang === 'ar' ? 'غير معروف' : 'Unknown';
  try {
    const dn = new Intl.DisplayNames([lang === 'ar' ? 'ar' : 'en'], { type: 'region' });
    return dn.of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

export function buildMarketerUrl(origin: string, slug: string, path = '/'): string {
  const base = origin.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(cleanPath, `${base}/`);
  url.searchParams.set('ref', slug);
  return url.toString();
}
