'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  ExternalLink,
  Building2,
  ChevronLeft,
  Globe,
} from 'lucide-react';
import Link from 'next/link';

type LandingLink = {
  id: number;
  type: string;
  titleAr: string;
  titleEn: string;
  url: string;
  projectId: number | null;
  projectImage: string | null;
};

type LandingPageClientProps = {
  landing: {
    slug: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    links: LandingLink[];
  };
  site: {
    logo?: string;
    siteName: { ar: string; en: string };
  };
};

function LinkIcon({ type, projectImage }: { type: string; projectImage: string | null }) {
  if (type === 'project' && projectImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={projectImage} alt="" className="w-full h-full object-cover" />
    );
  }
  if (type === 'whatsapp') {
    return (
      <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      </svg>
    );
  }
  if (type === 'maps') {
    return <MapPin className="w-7 h-7 text-gold-500" />;
  }
  if (type === 'project') {
    return <Building2 className="w-7 h-7 text-gold-500" />;
  }
  return <ExternalLink className="w-7 h-7 text-gold-500" />;
}

export default function LandingPageClient({ landing, site }: LandingPageClientProps) {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const logo = site.logo?.trim() || '/logo-tuwaiq.png';

  return (
    <main
      dir={direction}
      className="min-h-screen bg-slate-100 dark:bg-dark-950 text-slate-900 dark:text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-gold-500/5 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      <div className="relative max-w-lg mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="p-2 rounded-xl glass border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-dark-400 hover:text-gold-500 transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
          </Link>
          <button
            type="button"
            onClick={() => setLanguage((l) => (l === 'ar' ? 'en' : 'ar'))}
            className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-slate-200/80 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-dark-300"
          >
            <Globe className="w-4 h-4 text-gold-500" />
            {language === 'ar' ? 'EN' : 'ع'}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-2 border-gold-500/30 shadow-lg shadow-gold-500/10 bg-white dark:bg-dark-900 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt={site.siteName[language]} className="w-20 h-20 object-contain" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-slate-900 dark:text-white">
            {language === 'ar' ? landing.titleAr : landing.titleEn}
          </h1>
          {(language === 'ar' ? landing.descriptionAr : landing.descriptionEn) ? (
            <p className="text-slate-600 dark:text-dark-400 leading-relaxed text-sm sm:text-base px-2">
              {language === 'ar' ? landing.descriptionAr : landing.descriptionEn}
            </p>
          ) : null}
        </motion.div>

        <div className="space-y-4">
          {landing.links.map((link, index) => (
            <motion.a
              key={link.id}
              href={`/l/${landing.slug}/go/${link.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-4 rounded-2xl glass border border-slate-200/80 dark:border-white/10 hover:border-gold-500/40 transition-all shadow-sm hover:shadow-gold-500/10 group"
            >
              <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-slate-200/80 dark:bg-dark-800 flex items-center justify-center border border-slate-200/60 dark:border-white/5">
                <LinkIcon type={link.type} projectImage={link.projectImage} />
              </div>
              <div className="flex-1 min-w-0 text-start">
                <p className="font-bold text-slate-900 dark:text-white group-hover:text-gold-500 transition-colors truncate">
                  {language === 'ar' ? link.titleAr : link.titleEn}
                </p>
                {link.type === 'maps' && link.url ? (
                  <p className="text-xs text-slate-500 dark:text-dark-500 mt-1 truncate">{link.url}</p>
                ) : null}
              </div>
              <ExternalLink className="w-5 h-5 shrink-0 text-slate-400 dark:text-dark-500 group-hover:text-gold-500 transition-colors" />
            </motion.a>
          ))}
        </div>

        {landing.links.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-dark-500 py-12">
            {language === 'ar' ? 'لا توجد روابط بعد' : 'No links yet'}
          </p>
        ) : null}

        <p className="text-center text-xs text-slate-400 dark:text-dark-600 mt-12">
          {site.siteName[language]}
        </p>
      </div>
    </main>
  );
}
