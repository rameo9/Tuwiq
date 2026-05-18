import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const metadata: Metadata = {
  title: 'صقر الجزيرة للتطوير العقاري | Saqr Al Jazera Real Estate',
  description: 'نقدم لكم أفضل المشاريع العقارية الفاخرة في المملكة العربية السعودية - We offer you the finest luxury real estate projects in Saudi Arabia',
  keywords: 'عقارات, تطوير عقاري, فلل, شقق, مشاريع سكنية, السعودية, real estate, property, villas, apartments, Saudi Arabia',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
};

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
