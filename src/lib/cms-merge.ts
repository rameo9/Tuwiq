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
  return deepMerge(
    current as unknown as Record<string, unknown>,
    patch,
  ) as unknown as LandingPayload;
}

export function mergeSitePatch(
  patch: Record<string, unknown>,
  raw: string | null | undefined,
): SitePayload {
  const current = parseSiteFromDb(raw);
  return deepMerge(current as unknown as Record<string, unknown>, patch) as unknown as SitePayload;
}
