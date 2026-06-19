import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getPublicHomeBundle } from '@/lib/cms-read';
import { toAbsoluteUrl, getRequestOrigin } from '@/lib/absolute-url';
import { normalizeMediaUrl } from '@/lib/normalize-media-url';
import type { SerializedProject } from '@/types/project-detail';

function isUrlLike(text: string): boolean {
  const t = text.trim();
  return /^https?:\/\//i.test(t) || /maps\.|goo\.gl/i.test(t);
}

function pickOgDescription(project: {
  descriptionAr: string;
  descriptionEn: string;
  locationAr: string;
  locationEn: string;
  titleAr: string;
}): string {
  const desc = project.descriptionAr.trim() || project.descriptionEn.trim();
  if (desc) return desc.slice(0, 300);

  const loc = project.locationAr.trim() || project.locationEn.trim();
  if (loc && !isUrlLike(loc)) return loc.slice(0, 300);

  return project.titleAr;
}

function ogImageType(url: string): string | undefined {
  const lower = url.split('?')[0].toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return undefined;
}

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

  const title = project.titleAr.trim() || project.titleEn.trim();
  const description = pickOgDescription(project);
  const origin = getRequestOrigin();
  const pageUrl = `${origin}/projects/${id}`;
  const imageUrl = toAbsoluteUrl(normalizeMediaUrl(project.mainImageUrl), origin);
  const imageType = imageUrl ? ogImageType(imageUrl) : undefined;

  return {
    metadataBase: new URL(origin),
    title: `${project.titleAr} | ${project.titleEn}`,
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
                ...(imageType ? { type: imageType } : {}),
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
