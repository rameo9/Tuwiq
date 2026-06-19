import { NextRequest, NextResponse } from 'next/server';
import { recordMarketerClick } from '@/lib/marketer-track';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = String(body.ref ?? body.slug ?? '');
    const path = String(body.path ?? '/').trim() || '/';
    const projectIdRaw = body.projectId;

    let projectId: number | null = null;
    if (projectIdRaw != null && projectIdRaw !== '') {
      const n = Number(projectIdRaw);
      if (Number.isFinite(n)) projectId = n;
    }

    const ok = await recordMarketerClick({ req, slug, path, projectId });
    if (!ok) {
      return NextResponse.json({ ok: false, reason: 'unknown_marketer' });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Track failed' }, { status: 500 });
  }
}
