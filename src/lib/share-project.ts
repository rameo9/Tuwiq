import { toAbsoluteUrl } from '@/lib/absolute-url';

function safeFileName(title: string): string {
  return title.replace(/[^\w\u0600-\u06FF-]+/g, '-').slice(0, 48) || 'project';
}

/** Fetches the project hero image as a File for native share sheets (mobile). */
export async function fetchShareImageFile(
  imageUrl: string,
  title: string,
): Promise<File | null> {
  const absolute = toAbsoluteUrl(
    imageUrl,
    typeof window !== 'undefined' ? window.location.origin : undefined,
  );
  if (!absolute) return null;

  try {
    const res = await fetch(absolute);
    if (!res.ok) return null;

    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return null;

    const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    return new File([blob], `${safeFileName(title)}.${ext}`, { type: blob.type });
  } catch {
    return null;
  }
}

export type ProjectSharePayload = {
  title: string;
  text: string;
  url: string;
};

export async function shareProjectLink(
  payload: ProjectSharePayload,
  imageUrl: string,
): Promise<'shared' | 'copied' | 'cancelled' | 'prompt'> {
  const file = await fetchShareImageFile(imageUrl, payload.title);

  if (typeof navigator.share === 'function') {
    const withFiles = file ? { ...payload, files: [file] } : payload;
    if (!file || navigator.canShare?.(withFiles)) {
      try {
        await navigator.share(withFiles);
        return 'shared';
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
      }
    }

    try {
      await navigator.share(payload);
      return 'shared';
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
    }
  }

  try {
    await navigator.clipboard.writeText(payload.url);
    return 'copied';
  } catch {
    window.prompt('Copy link:', payload.url);
    return 'prompt';
  }
}
