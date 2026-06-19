import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recordMarketerClick } from '@/lib/marketer-track';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; projectId: string } },
) {
  const projectId = Number(params.projectId);
  if (!Number.isFinite(projectId)) {
    return NextResponse.redirect(new URL('/', req.url), 302);
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  const path = `/projects/${projectId}`;

  await recordMarketerClick({
    req,
    slug: params.slug,
    path,
    projectId,
  });

  const dest = new URL(project ? path : '/', req.url);
  return NextResponse.redirect(dest, 302);
}
