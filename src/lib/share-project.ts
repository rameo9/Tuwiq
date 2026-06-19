import { ensureShareMetaTags, toAbsoluteClientUrl } from '@/lib/ensure-share-meta';

export type ProjectSharePayload = {
  title: string;
  text: string;
  url: string;
  description?: string;
  imageUrl?: string;
};

function isUrlLike(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return (
    /^https?:\/\//i.test(t) ||
    /maps\.(google|app\.goo)/i.test(t) ||
    /goo\.gl\/maps/i.test(t) ||
    /maps\.app\.goo\.gl/i.test(t)
  );
}

function stripUrls(text: string): string {
  return text
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildShareText(title: string, subtitle: string): string {
  const cleanTitle = title.trim();
  let cleanSubtitle = subtitle.trim();
  if (isUrlLike(cleanSubtitle)) cleanSubtitle = '';
  cleanSubtitle = stripUrls(cleanSubtitle);
  if (!cleanSubtitle || cleanSubtitle === cleanTitle) return cleanTitle;
  return `${cleanTitle}\n${cleanSubtitle}`;
}

function isMobileShare(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function primeShareMeta(payload: ProjectSharePayload) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const imageUrl = payload.imageUrl
    ? toAbsoluteClientUrl(payload.imageUrl, origin) || payload.imageUrl
    : '';

  ensureShareMetaTags({
    title: payload.title.trim(),
    description: (payload.description ?? payload.text ?? payload.title).trim(),
    url: payload.url.trim(),
    imageUrl,
  });
}

async function tryNativeShare(data: ShareData): Promise<boolean> {
  if (typeof navigator.share !== 'function') return false;
  try {
    if (navigator.canShare && !navigator.canShare(data)) return false;
    await navigator.share(data);
    return true;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') throw e;
    return false;
  }
}

/**
 * Shares project link. On mobile tries several Web Share payloads, then copies URL.
 */
export async function shareProjectLink(
  payload: ProjectSharePayload,
): Promise<'shared' | 'copied' | 'cancelled' | 'prompt'> {
  const title = payload.title.trim();
  const url = payload.url.trim();
  const shareText = buildShareText(title, payload.text);

  primeShareMeta({ ...payload, title, url });

  if (typeof navigator.share === 'function') {
    const attempts: ShareData[] = isMobileShare()
      ? [{ title, url }, { url }, { title, text: shareText, url }]
      : [{ title, text: shareText, url }, { title, url }, { url }];

    for (const data of attempts) {
      try {
        if (await tryNativeShare(data)) return 'shared';
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    window.prompt('Copy link:', url);
    return 'prompt';
  }
}

export function shareSubtitleFromLocation(location: string): string {
  const trimmed = location.trim();
  if (!trimmed || isUrlLike(trimmed)) return '';
  return stripUrls(trimmed);
}

export { ensureShareMetaTags, toAbsoluteClientUrl };
