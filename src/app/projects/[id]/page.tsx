import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getPublicHomeBundle } from '@/lib/cms-read';
import { toAbsoluteUrl, getRequestOrigin } from '@/lib/absolute-url';
import type { SerializedProject } from '@/types/project-detail';

export const dynamic = 'force-dynamic';

const ProjectDetailClient = nextDynamic(() => import('./ProjectDetailClient'), {
  ssr: true,
});

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return {};

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return {};

  const title = `${project.titleAr} | ${project.titleEn}`;
  const description =
    project.descriptionAr.trim() ||
    project.descriptionEn.trim() ||
    `${project.locationAr} — ${project.locationEn}`;
  const origin = getRequestOrigin();
  const pageUrl = `${origin}/projects/${id}`;
  const imageUrl = toAbsoluteUrl(project.mainImageUrl, origin);

  return {
    metadataBase: new URL(origin),
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'website',
      url: pageUrl,
      title,
      description,
      locale: 'ar_SA',
      siteName: 'Tuwaiq',
      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                secureUrl: imageUrl.startsWith('https://') ? imageUrl : undefined,
                width: 1200,
                height: 630,
                alt: project.titleAr,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

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
