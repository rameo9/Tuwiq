export type ProjectSharePayload = {
  title: string;
  text: string;
  url: string;
};

/**
 * Shares project link + title. Image preview comes from Open Graph when the
 * recipient app loads the URL (do not attach files — WhatsApp sends image only).
 */
export async function shareProjectLink(
  payload: ProjectSharePayload,
): Promise<'shared' | 'copied' | 'cancelled' | 'prompt'> {
  const body = [payload.title, payload.text, payload.url].filter(Boolean).join('\n');

  const shareData: ShareData = {
    title: payload.title,
    text: body,
    url: payload.url,
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
      await navigator.share({ title: payload.title, text: body, url: payload.url });
      return 'shared';
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
    }
  }

  try {
    await navigator.clipboard.writeText(body);
    return 'copied';
  } catch {
    window.prompt('Copy link:', body);
    return 'prompt';
  }
}
