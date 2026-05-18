import { prisma } from '@/lib/prisma';
import { parseLandingFromDb, parseSiteFromDb } from '@/lib/cms-merge';

export { defaultLanding, defaultSite } from '@/lib/cms-defaults';
export type { LandingPayload, SitePayload } from '@/lib/cms-defaults';

export async function getPublicHomeBundle() {
  const [projects, gallery, services, socialLinks, landingRow, siteRow] =
    await Promise.all([
      prisma.project.findMany({
        orderBy: { id: 'asc' },
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          locationAr: true,
          locationEn: true,
          area: true,
          units: true,
          categoryAr: true,
          categoryEn: true,
          mainImageUrl: true,
        },
      }),
      prisma.galleryItem.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.serviceItem.findMany({
        where: { enabled: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.socialLink.findMany({
        where: { enabled: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.siteSetting.findUnique({ where: { key: 'landing' } }),
      prisma.siteSetting.findUnique({ where: { key: 'site' } }),
    ]);

  const landing = parseLandingFromDb(landingRow?.value ?? null);
  const site = parseSiteFromDb(siteRow?.value ?? null);

  return {
    projects,
    gallery,
    services,
    socialLinks,
    landing,
    site,
  };
}
