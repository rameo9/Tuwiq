/** Parses hero promo video URL (YouTube or uploaded file). */
export type HeroVideoSource =
  | { kind: 'youtube'; embedUrl: string }
  | { kind: 'file'; src: string };

export function parseHeroVideoUrl(raw: string | undefined | null): HeroVideoSource | null {
  const url = String(raw ?? '').trim();
  if (!url) return null;

  const yt =
    url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i)?.[1] ??
    url.match(/^[\w-]{11}$/)?.[0];
  if (yt) {
    return {
      kind: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0`,
    };
  }

  if (url.startsWith('/uploads/') || url.startsWith('http://') || url.startsWith('https://')) {
    return { kind: 'file', src: url };
  }

  return null;
}
