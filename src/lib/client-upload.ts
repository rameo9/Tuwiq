import { compressImageForUpload } from '@/lib/compress-image';
import { normalizeMediaUrl } from '@/lib/normalize-media-url';

const UPLOAD_TIMEOUT_MS = 90_000;

/**
 * Uploads a file via `/api/upload`. Parses JSON when possible so Nginx 413 HTML
 * pages don't break with `res.json()` and the user sees a clearer message.
 */
export async function uploadAdminFile(file: File): Promise<string> {
  const prepared = await compressImageForUpload(file);
  const fd = new FormData();
  fd.append('file', prepared);

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: fd,
      credentials: 'include',
      signal: controller.signal,
    });
    const text = await res.text();
    let data: { url?: string; error?: string } = {};
    try {
      if (text) data = JSON.parse(text) as { url?: string; error?: string };
    } catch {
      /* Nginx/other may return HTML */
    }

    if (res.ok) {
      const url = normalizeMediaUrl(data.url);
      if (!url) throw new Error('استجابة الرفع لا تحتوي على رابط');
      return url;
    }

    if (res.status === 413) {
      throw new Error(
        'حجم الطلب أكبر من حد البروكسي (413). على Nginx ضَعْ client_max_body_size 25m; ثم أعد تحميل Nginx، أو استخدم صورة أصغر.',
      );
    }

    const serverMsg = data.error?.trim();
    throw new Error(serverMsg || `فشل الرفع (${res.status})`);
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(
        'انتهت مهلة الرفع (90 ثانية). جرّب صورة أصغر أو تحقق من اتصال السيرفر وNginx.',
      );
    }
    throw e;
  } finally {
    window.clearTimeout(timer);
  }
}
