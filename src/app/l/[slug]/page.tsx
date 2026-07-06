import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { parseSiteFromDb } from '@/lib/cms-merge';
import { normalizeCampaignSlug } from '@/lib/campaign-landing';
import { normalizeMediaUrl } from '@/lib/normalize-media-url';
import LandingPageClient from './LandingPageClient';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const slug = normalizeCampaignSlug(params.slug);
  const landing = await prisma.campaignLanding.findFirst({
    where: { slug, enabled: true },
    select: { titleAr: true, titleEn: true, descriptionAr: true },
  });
  if (!landing) return { title: 'TUWAIQ' };
  return {
    title: landing.titleAr,
    description: landing.descriptionAr || landing.titleAr,
  };
}

export default async function CampaignLandingPage({ params }: Props) {
  const slug = normalizeCampaignSlug(params.slug);
  if (!slug) notFound();

  const [landing, siteRow] = await Promise.all([
    prisma.campaignLanding.findFirst({
      where: { slug, enabled: true },
      include: {
        links: {
          where: { enabled: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    prisma.siteSetting.findUnique({ where: { key: 'site' } }),
  ]);

  if (!landing) notFound();

  await prisma.campaignLanding.update({
    where: { id: landing.id },
    data: { viewCount: { increment: 1 } },
  });

  const site = parseSiteFromDb(siteRow?.value ?? null);

  const projectIds = landing.links
    .filter((l) => l.type === 'project' && l.projectId)
    .map((l) => l.projectId as number);

  const projects =
    projectIds.length > 0
      ? await prisma.project.findMany({
          where: { id: { in: projectIds } },
          select: { id: true, titleAr: true, titleEn: true, mainImageUrl: true },
        })
      : [];

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  return (
    <LandingPageClient
      landing={{
        slug: landing.slug,
        titleAr: landing.titleAr,
        titleEn: landing.titleEn,
        descriptionAr: landing.descriptionAr,
        descriptionEn: landing.descriptionEn,
        links: landing.links.map((link) => ({
          id: link.id,
          type: link.type,
          titleAr: link.titleAr,
          titleEn: link.titleEn,
          url: link.url,
          projectId: link.projectId,
          projectImage:
            link.projectId && projectMap[link.projectId]
              ? normalizeMediaUrl(projectMap[link.projectId].mainImageUrl)
              : null,
        })),
      }}
      site={{
        logo: site.logo,
        siteName: site.siteName,
      }}
    />
  );
}
