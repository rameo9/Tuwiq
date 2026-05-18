import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { prisma } from '@/lib/prisma';
import { parseSiteFromDb } from '@/lib/cms-merge';

const FALLBACK_KEYWORDS =
  'عقارات, تطوير عقاري, فلل, شقق, مشاريع سكنية, السعودية, real estate, property, villas, apartments, Saudi Arabia';

export async function generateMetadata(): Promise<Metadata> {
  const row = await prisma.siteSetting.findUnique({ where: { key: 'site' } });
  const site = parseSiteFromDb(row?.value ?? null);

  const title = `${site.siteName.ar} | ${site.siteName.en}`;
  const description = `${site.siteDescription.ar} — ${site.siteDescription.en}`;
  const kw = site.metaKeywords?.trim();

  const fav = site.favicon?.trim();
  const icons: Metadata['icons'] = fav
    ? { icon: fav, shortcut: fav }
    : { icon: '/icon.svg', shortcut: '/icon.svg' };

  return {
    title,
    description,
    keywords: kw || FALLBACK_KEYWORDS,
    icons,
  };
}

/** Read site row for `<title>` / favicon every request — matches CMS admin settings */
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased transition-colors dark:bg-dark-950 dark:text-white">
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
