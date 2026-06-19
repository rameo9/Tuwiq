import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { verifyAdminSession } from '@/lib/api-auth';
import { getUploadDir } from '@/lib/upload-dir';

const MAX_IMAGE = 15 * 1024 * 1024;
const MAX_VIDEO = 25 * 1024 * 1024;
const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

export async function POST(req: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? MAX_VIDEO : MAX_IMAGE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: isVideo ? 'Video too large (max 25 MB)' : 'File too large' },
        { status: 400 },
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const ext =
      path.extname(file.name).slice(0, 8) ||
      (file.type === 'application/pdf'
        ? '.pdf'
        : file.type === 'video/webm'
          ? '.webm'
          : file.type.startsWith('video/')
            ? '.mp4'
            : '');
    const name = `${uuidv4()}${ext}`;
    const uploadDir = getUploadDir();
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, name), buf);
    console.info('[upload] saved', path.join(uploadDir, name));
    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
