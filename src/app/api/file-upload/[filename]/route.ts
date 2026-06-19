import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getUploadDir } from '@/lib/upload-dir';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { filename: string } },
) {
  const name = path.basename(params.filename ?? '');
  if (!name || name !== params.filename || name.includes('..')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const ext = path.extname(name).toLowerCase();
  const contentType = MIME[ext];
  if (!contentType) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const filePath = path.join(getUploadDir(), name);
  try {
    const buf = await fs.readFile(filePath);
    return new NextResponse(buf, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
