/**
 * Uploads a file via `/api/upload`. Parses JSON when possible so Nginx 413 HTML
 * pages don't break with `res.json()` and the user sees a clearer message.
 */
export async function uploadAdminFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: fd,
    credentials: 'include',
  });
  const text = await res.text();
  let data: { url?: string; error?: string } = {};
  try {
    if (text) data = JSON.parse(text) as { url?: string; error?: string };
  } catch {
    /* Nginx/other may return HTML */
  }

  if (res.ok) {
    const url = data.url;
    if (!url) throw new Error('استجابة الرفع لا تحتوي على رابط');
    return url;
  }

  if (res.status === 413) {
    throw new Error(
      'حجم الطلب أكبر من حد البروكسي (413). على Nginx ضَعْ مثلاً client_max_body_size 25m; ضمن كتلة http أو server، ثم أعد تحميل Nginx، أو استخدم ملفًا أصغر (حد التطبيق 15 MB تقريبًا).'
    );
  }

  const serverMsg = data.error?.trim();
  throw new Error(serverMsg || `فشل الرفع (${res.status})`);
}
