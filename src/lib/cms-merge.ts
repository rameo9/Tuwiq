import {
  defaultLanding,
  defaultSite,
  type LandingPayload,
  type SitePayload,
} from '@/lib/cms-defaults';

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Deep-merge plain objects; arrays and primitives from patch replace outright. */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  patch: Record<string, unknown>,
): T {
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(patch)) {
    const pVal = patch[key];
    if (pVal === undefined) continue;
    if (Array.isArray(pVal)) {
      out[key] = pVal;
      continue;
    }
    if (isPlainObject(pVal)) {
      const bVal = out[key];
      if (isPlainObject(bVal)) {
        out[key] = deepMerge(bVal as Record<string, unknown>, pVal);
      } else {
        out[key] = deepMerge({} as Record<string, unknown>, pVal);
      }
      continue;
    }
    out[key] = pVal;
  }
  return out as T;
}

function cloneLanding(): LandingPayload {
  return JSON.parse(JSON.stringify(defaultLanding)) as LandingPayload;
}

function cloneSite(): SitePayload {
  return JSON.parse(JSON.stringify(defaultSite)) as SitePayload;
}

function normalizeLegacyCopyright(landing: LandingPayload): void {
  const ar = landing.footer.copyright?.ar ?? '';
  const en = landing.footer.copyright?.en ?? '';
  const legacy =
    /صقر\s*الجزيرة|Saqr\s*Al\s*Jazera/i.test(`${ar} ${en}`) ||
    (ar.includes('جميع الحقوق') && !ar.includes('طويق'));
  if (legacy) {
    landing.footer.copyright = { ar: '© طويق', en: '© Tuwaiq' };
  }
}

export function parseLandingFromDb(raw: string | null | undefined): LandingPayload {
  const base = cloneLanding();
  if (!raw) return base;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const merged = deepMerge(
      base as unknown as Record<string, unknown>,
      parsed,
    ) as unknown as LandingPayload;
    const pa = parsed.about as Record<string, unknown> | undefined;
    if (!Array.isArray(pa?.features) || (pa.features as unknown[]).length === 0) {
      merged.about.features = base.about.features;
    }
    if (typeof merged.hero.videoUrl !== 'string') {
      merged.hero.videoUrl = '';
    }
    normalizeLegacyCopyright(merged);
    return merged;
  } catch {
    return base;
  }
}

export function parseSiteFromDb(raw: string | null | undefined): SitePayload {
  const base = cloneSite();
  if (!raw) return base;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return deepMerge(base as unknown as Record<string, unknown>, parsed) as unknown as SitePayload;
  } catch {
    return base;
  }
}

export function mergeLandingPatch(
  patch: Record<string, unknown>,
  raw: string | null | undefined,
): LandingPayload {
  const current = parseLandingFromDb(raw);
  const merged = deepMerge(
    current as unknown as Record<string, unknown>,
    patch,
  ) as unknown as LandingPayload;
  if (typeof merged.hero.videoUrl !== 'string') {
    merged.hero.videoUrl = '';
  }
  normalizeLegacyCopyright(merged);
  return merged;
}

export function mergeSitePatch(
  patch: Record<string, unknown>,
  raw: string | null | undefined,
): SitePayload {
  const current = parseSiteFromDb(raw);
  return deepMerge(current as unknown as Record<string, unknown>, patch) as unknown as SitePayload;
}
