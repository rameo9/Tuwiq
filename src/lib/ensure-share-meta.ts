type ShareMetaInput = {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
};

function setMetaProperty(property: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setMetaName(name: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLinkRel(rel: string, href: string) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Keeps OG tags in the live document (needed for iOS share sheet after client navigation). */
export function ensureShareMetaTags(input: ShareMetaInput) {
  if (typeof document === 'undefined') return;

  setMetaProperty('og:title', input.title);
  setMetaProperty('og:description', input.description);
  setMetaProperty('og:url', input.url);
  setMetaProperty('og:type', 'website');

  if (input.imageUrl) {
    setMetaProperty('og:image', input.imageUrl);
    setMetaProperty('og:image:secure_url', input.imageUrl);
    setLinkRel('image_src', input.imageUrl);
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:image', input.imageUrl);

    const img = new Image();
    img.src = input.imageUrl;
  }

  setMetaName('twitter:title', input.title);
  setMetaName('twitter:description', input.description);

  document.title = input.title;
}

export function toAbsoluteClientUrl(path: string, origin: string): string {
  const raw = String(path ?? '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = origin.replace(/\/$/, '');
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}
