/** Fixes /uploads paths pasted or stored without a leading slash or with a trailing slash. */
export function normalizeMediaUrl(input: string | null | undefined): string {
  let url = String(input ?? '').trim();
  if (!url) return '';

  if (!url.startsWith('http://') && !url.startsWith('https://') && url.endsWith('/')) {
    url = url.replace(/\/+$/, '');
  }

  if (url.startsWith('uploads/')) {
    return `/${url}`;
  }

  return url;
}
