/** Classify automated / preview / bot traffic (Meta review, crawlers, etc.). */
export function isSuspiciousClick(userAgent: string): boolean {
  const ua = userAgent.trim().toLowerCase();
  if (!ua) return true;

  const botPatterns = [
    'facebookexternalhit',
    'facebot',
    'meta-externalagent',
    'meta-external',
    'whatsapp',
    'telegrambot',
    'twitterbot',
    'linkedinbot',
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'yandexbot',
    'baiduspider',
    'applebot',
    'petalbot',
    'semrushbot',
    'ahrefsbot',
    'mj12bot',
    'dotbot',
    'rogerbot',
    'curl/',
    'wget/',
    'python-requests',
    'python-urllib',
    'go-http-client',
    'java/',
    'headlesschrome',
    'phantomjs',
    'scrapy',
    'crawler',
    'spider',
    'bot/',
    'bot;',
    'preview',
    'lighthouse',
    'pingdom',
    'uptimerobot',
  ];

  return botPatterns.some((p) => ua.includes(p));
}

export type ClickKindRow = { isSuspicious: boolean; userAgent: string };

export function resolveClickSuspicious(click: ClickKindRow): boolean {
  return click.isSuspicious || isSuspiciousClick(click.userAgent);
}

export function splitClickCounts(clicks: ClickKindRow[]) {
  let suspicious = 0;
  for (const c of clicks) {
    if (resolveClickSuspicious(c)) suspicious += 1;
  }
  return {
    total: clicks.length,
    suspicious,
    real: clicks.length - suspicious,
  };
}
