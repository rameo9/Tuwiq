import nextDynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getPublicHomeBundle } from '@/lib/cms-read';
import type { SerializedProject } from '@/types/project-detail';

export const dynamic = 'force-dynamic';

const ProjectDetailClient = nextDynamic(() => import('./ProjectDetailClient'), {
  ssr: true,
});

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      features: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!project) notFound();

  await prisma.project.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  const bundle = await getPublicHomeBundle();

  const serialized: SerializedProject = {
    id: project.id,
    titleAr: project.titleAr,
    titleEn: project.titleEn,
    locationAr: project.locationAr,
    locationEn: project.locationEn,
    descriptionAr: project.descriptionAr,
    descriptionEn: project.descriptionEn,
    area: project.area,
    units: project.units,
    status: project.status,
    categoryAr: project.categoryAr,
    categoryEn: project.categoryEn,
    mainImageUrl: project.mainImageUrl,
    pdfUrl: project.pdfUrl,
    completionYear: project.completionYear,
    mapUrl: project.mapUrl,
    images: project.images.map(({ url, sortOrder }) => ({ url, sortOrder })),
    features: project.features.map(({ textAr, textEn, sortOrder }) => ({
      textAr,
      textEn,
      sortOrder,
    })),
  };

  const socialLinks = bundle.socialLinks.map((s) => ({
    platform: s.platform,
    url: s.url,
  }));

  return (
    <ProjectDetailClient
      project={serialized}
      site={bundle.site}
      footer={bundle.landing.footer}
      socialLinks={socialLinks}
      showNewsletter={bundle.landing.footer.showNewsletter ?? true}
    />
  );
}
