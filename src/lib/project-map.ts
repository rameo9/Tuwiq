import { isGoogleMapsLink, looksLikeHttpUrl } from '@/lib/google-maps';
import { shareSubtitleFromLocation } from '@/lib/share-project';

type ProjectMapFields = {
  mapUrl: string | null;
  locationAr: string;
  locationEn: string;
  titleAr: string;
  titleEn: string;
};

/** Project map link: mapUrl field, or a Google Maps URL stored in location by mistake. */
export function pickProjectMapUrl(project: ProjectMapFields): string | null {
  const fromField = project.mapUrl?.trim();
  if (fromField) return fromField;

  for (const loc of [project.locationAr, project.locationEn]) {
    const t = loc?.trim();
    if (t && looksLikeHttpUrl(t) && isGoogleMapsLink(t)) return t;
  }

  return null;
}

/** Human-readable place name for geocode / map label (never a URL). */
export function pickProjectMapQuery(
  project: ProjectMapFields,
  language: 'ar' | 'en',
): string {
  const primary = shareSubtitleFromLocation(
    language === 'ar' ? project.locationAr : project.locationEn,
  );
  if (primary) return primary;

  const secondary = shareSubtitleFromLocation(
    language === 'ar' ? project.locationEn : project.locationAr,
  );
  if (secondary) return secondary;

  return (language === 'ar' ? project.titleAr : project.titleEn).trim();
}
