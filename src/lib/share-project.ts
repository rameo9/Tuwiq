export type ProjectSharePayload = {
  title: string;
  text: string;
  url: string;
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

/**
 * Shares project link + title. Image preview comes from Open Graph when the
 * recipient app loads the URL (do not attach files — WhatsApp sends image only).
 * Never puts extra URLs in text — WhatsApp previews the first link it finds.
 */
export async function shareProjectLink(
  payload: ProjectSharePayload,
): Promise<'shared' | 'copied' | 'cancelled' | 'prompt'> {
  const title = payload.title.trim();
  const url = payload.url.trim();
  const shareText = buildShareText(title, payload.text);

  const shareData: ShareData = {
    title,
    text: shareText,
    url,
  };

  if (typeof navigator.share === 'function') {
    try {
      if (!navigator.canShare || navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return 'shared';
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
    }

    try {
      await navigator.share({ title, text: shareText, url });
      return 'shared';
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
    }
  }

  try {
    await navigator.clipboard.writeText(`${shareText}\n${url}`);
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
