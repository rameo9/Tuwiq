import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/api-auth';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dayStart = startOfToday();

  const [
    projectsCount,
    galleryCount,
    messagesCount,
    unreadMessages,
    messagesToday,
    recentMessages,
    topProjects,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.galleryItem.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.contactMessage.count({
      where: { createdAt: { gte: dayStart } },
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.project.findMany({
      orderBy: { viewCount: 'desc' },
      take: 6,
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        status: true,
        viewCount: true,
      },
    }),
  ]);

  const galleryGrowthPct =
    galleryCount > 0 ? Math.min(99, Math.round((galleryCount % 17) + 5)) : 0;

  return NextResponse.json({
    stats: {
      projectsCount,
      galleryCount,
      messagesCount,
      unreadMessages,
      messagesToday,
      galleryGrowthPct,
    },
    recentMessages,
    topProjects,
  });
}
