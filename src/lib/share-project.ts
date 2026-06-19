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

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/** iOS share sheet reads attached files for the preview thumbnail. */
async function tryIosImageShare(
  url: string,
  title: string,
  imageUrl: string,
): Promise<boolean> {
  if (!isIos() || !imageUrl || typeof navigator.share !== 'function') return false;

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return false;

    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return false;

    const ext = blob.type.includes('png') ? 'png' : 'jpg';
    const file = new File([blob], `tuwaiq-project.${ext}`, { type: blob.type });
    const data: ShareData = { files: [file], url, title };

    if (!navigator.canShare || navigator.canShare(data)) {
      await navigator.share(data);
      return true;
    }
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') throw e;
  }

  return false;
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

/**
 * Shares project link. Image preview comes from Open Graph when the recipient
 * app loads the URL. On mobile, share URL only so iOS/Android fetch OG tags.
 */
export async function shareProjectLink(
  payload: ProjectSharePayload,
): Promise<'shared' | 'copied' | 'cancelled' | 'prompt'> {
  const title = payload.title.trim();
  const url = payload.url.trim();
  const shareText = buildShareText(title, payload.text);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const imageUrl = payload.imageUrl
    ? toAbsoluteClientUrl(payload.imageUrl, origin) || payload.imageUrl
    : '';

  primeShareMeta({ ...payload, title, url, imageUrl });

  if (typeof navigator.share === 'function') {
    if (isMobileShare()) {
      if (imageUrl) {
        try {
          const sharedWithImage = await tryIosImageShare(url, title, imageUrl);
          if (sharedWithImage) return 'shared';
        } catch (e) {
          if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
        }
      }

      try {
        await navigator.share({ url });
        return 'shared';
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
      }
    }

    const shareData: ShareData = { title, text: shareText, url };

    try {
      if (!navigator.canShare || navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return 'shared';
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
    }

    try {
      await navigator.share({ url });
      return 'shared';
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
    }
  }

  try {
    await navigator.clipboard.writeText(isMobileShare() ? url : `${shareText}\n${url}`);
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
