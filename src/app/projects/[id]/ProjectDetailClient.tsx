'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/sections/Footer';
import Card3D from '@/components/ui/Card3D';
import { 
  MapPin, 
  Maximize, 
  Home, 
  Download, 
  Share2, 
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  FileText,
  Calendar,
  Building2,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Star,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import type { LandingPayload, SitePayload } from '@/lib/cms-read';
import type { SerializedProject } from '@/types/project-detail';
import LocationMap from '@/components/LocationMap';
import { shareProjectLink } from '@/lib/share-project';

function buildProjectImageUrls(mainImageUrl: string, rows: { url: string }[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (u: string) => {
    const s = String(u || '').trim();
    if (!s || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };
  push(mainImageUrl);
  rows.forEach((r) => push(r.url));
  return out.length > 0
    ? out
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80'];
}

type ProjectDetailClientProps = {
  project: SerializedProject;
  site: SitePayload;
  footer: LandingPayload['footer'];
  socialLinks: Array<{ platform: string; url: string }>;
  showNewsletter: boolean;
};

export default function ProjectDetailClient({
  project,
  site,
  footer,
  socialLinks,
  showNewsletter,
}: ProjectDetailClientProps) {
  const { language, direction, t } = useLanguage();
  const [currentImage, setCurrentImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [shareNotice, setShareNotice] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.3, 0.8]);

  const viewModel = useMemo(() => {
    const images = buildProjectImageUrls(project.mainImageUrl, project.images);
    const title = { ar: project.titleAr, en: project.titleEn };
    const description = { ar: project.descriptionAr, en: project.descriptionEn };
    const location = { ar: project.locationAr, en: project.locationEn };
    const status = { ar: project.status, en: project.status };
    const features = project.features.map((f) => ({ ar: f.textAr, en: f.textEn }));
    return {
      id: project.id,
      title,
      description,
      location,
      area: project.area,
      units: project.units,
      completionDate: project.completionYear.trim() || '—',
      status,
      images,
      features,
      pdfUrl: project.pdfUrl?.trim() ?? '',
    };
  }, [project]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = viewModel.title[language];
    const text = viewModel.location[language];

    const result = await shareProjectLink({ title, text, url });

    if (result === 'copied') {
      setShareNotice(language === 'ar' ? 'تم نسخ الرابط' : 'Link copied');
      window.setTimeout(() => setShareNotice(''), 2500);
    }
  };

  const navigateImage = (dir: 'prev' | 'next') => {
    const len = viewModel.images.length;
    if (len <= 1) return;
    if (dir === 'prev') {
      setCurrentImage((prev) => (prev === 0 ? len - 1 : prev - 1));
    } else {
      setCurrentImage((prev) => (prev === len - 1 ? 0 : prev + 1));
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-slate-100 text-slate-900 dark:bg-dark-950 dark:text-white">
      <Navbar siteName={site.siteName} logo={site.logo} />

      {/* Hero Image Gallery */}
      <section ref={heroRef} className="relative h-[52vh] min-h-[260px] sm:h-[65vh] md:h-[80vh] overflow-hidden">
        <button
          type="button"
          aria-label={language === 'ar' ? 'عرض الصور' : 'View images'}
          className="absolute inset-0 z-0 sm:hidden"
          onClick={() => setIsLightboxOpen(true)}
        />
        {/* Main Image with Parallax */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0 pointer-events-none"
            style={{ y: imageY, scale: imageScale }}
          >
            <img
              src={viewModel.images[currentImage]}
              alt={viewModel.title[language]}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Advanced Overlays */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/30 to-transparent"
          style={{ opacity: overlayOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/50 via-transparent to-dark-950/50" />
        
        {/* Dynamic Spotlight Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle 400px at ${mousePosition.x}px ${mousePosition.y}px, rgba(212,175,55,0.15), transparent)`,
          }}
        />

        {/* Floating Particles — desktop only */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gold-500/40 rounded-full hidden sm:block"
            style={{
              left: `${20 + i * 10}%`,
              bottom: '20%',
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Navigation */}
        <motion.button
          type="button"
          onClick={() => navigateImage('prev')}
          aria-label={language === 'ar' ? 'الصورة السابقة' : 'Previous image'}
          className="absolute top-1/2 -translate-y-1/2 start-2 sm:start-6 z-10 p-2 sm:p-4 rounded-full glass hover:bg-gold-500/20 transition-all border border-white/10 hover:border-gold-500/50"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          {direction === 'rtl' ? (
            <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
          ) : (
            <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
          )}
        </motion.button>
        <motion.button
          type="button"
          onClick={() => navigateImage('next')}
          aria-label={language === 'ar' ? 'الصورة التالية' : 'Next image'}
          className="absolute top-1/2 -translate-y-1/2 end-2 sm:end-6 z-10 p-2 sm:p-4 rounded-full glass hover:bg-gold-500/20 transition-all border border-white/10 hover:border-gold-500/50"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          {direction === 'rtl' ? (
            <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
          ) : (
            <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
          )}
        </motion.button>

        {/* View All — tablet+ */}
        <motion.button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-24 end-4 sm:bottom-28 sm:end-6 hidden sm:flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 glass rounded-2xl text-white hover:bg-gold-500/10 transition-all z-10 border border-white/10 hover:border-gold-500/50"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ZoomIn className="w-5 h-5 shrink-0" />
          <span className="font-medium text-sm sm:text-base">
            {language === 'ar' ? 'عرض الكل' : 'View All'}
          </span>
          <span className="px-2.5 py-0.5 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 rounded-full text-xs sm:text-sm font-bold">
            {viewModel.images.length}
          </span>
        </motion.button>

        {/* Dots */}
        <div className="absolute bottom-4 sm:bottom-28 inset-x-0 flex justify-center gap-1.5 sm:gap-2 z-10 px-4">
          {viewModel.images.map((_, index) => (
            <motion.button
              key={index}
              type="button"
              onClick={() => setCurrentImage(index)}
              aria-label={`${language === 'ar' ? 'صورة' : 'Image'} ${index + 1}`}
              className="relative p-1"
              whileTap={{ scale: 0.9 }}
            >
              <div
                className={`h-1.5 sm:h-2 rounded-full transition-all ${
                  currentImage === index ? 'w-6 sm:w-8 bg-gold-500' : 'w-1.5 sm:w-2 bg-white/50'
                }`}
              />
            </motion.button>
          ))}
        </div>

        {/* Thumbnails — tablet+ */}
        <div className="absolute bottom-6 start-4 sm:start-6 hidden md:flex gap-2 sm:gap-3 z-10 max-w-[calc(100%-2rem)] overflow-x-auto">
          {viewModel.images.slice(0, 5).map((img, index) => (
            <motion.button
              key={index}
              type="button"
              onClick={() => setCurrentImage(index)}
              className={`relative shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all ${
                currentImage === index
                  ? 'ring-2 ring-gold-500 scale-105 shadow-lg shadow-gold-500/30'
                  : 'opacity-60 hover:opacity-100'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>

        {/* Back */}
        <Link href="/#projects" className="absolute top-20 sm:top-24 start-3 sm:start-6 z-10">
          <motion.div
            className="flex items-center gap-2 sm:gap-3 text-white glass px-3 py-2 sm:px-5 sm:py-3 rounded-xl border border-white/10 hover:border-gold-500/50 max-w-[calc(100vw-1.5rem)]"
            initial={{ opacity: 0, x: direction === 'rtl' ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.98 }}
          >
            {direction === 'rtl' ? (
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            ) : (
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            )}
            <span className="font-medium text-xs sm:text-sm truncate">
              {language === 'ar' ? 'العودة للمشاريع' : 'Back to Projects'}
            </span>
          </motion.div>
        </Link>

        {/* Project Title Overlay */}
        <motion.div
          className="absolute bottom-28 left-1/2 -translate-x-1/2 text-center z-10 hidden md:block"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-white mb-2"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {viewModel.title[language]}
          </motion.h1>
          <motion.div 
            className="flex items-center justify-center gap-2 text-gold-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <MapPin className="w-5 h-5" />
            <span>{viewModel.location[language]}</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Project Info */}
      <section className="relative -mt-10 sm:-mt-16 md:-mt-20 z-20 pb-12 sm:pb-20">
        <motion.div
          className="absolute top-0 start-1/4 w-[min(500px,100vw)] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
              {/* Title Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Card3D intensity={5} className="rounded-3xl">
                  <div className="glass rounded-3xl p-4 sm:p-8 border border-white/10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
                      <div className="min-w-0 flex-1">
                        <motion.span 
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-gold-500/20 to-gold-600/10 text-gold-400 text-sm font-semibold mb-4 border border-gold-500/20"
                          animate={{
                            boxShadow: [
                              '0 0 10px rgba(212,175,55,0)',
                              '0 0 20px rgba(212,175,55,0.3)',
                              '0 0 10px rgba(212,175,55,0)',
                            ],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Sparkles className="w-4 h-4" />
                          {viewModel.status[language]}
                        </motion.span>
                        <motion.h1 
                          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white break-words"
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {viewModel.title[language]}
                        </motion.h1>
                        <motion.div 
                          className="flex items-center gap-2 mt-3 text-dark-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <MapPin className="w-5 h-5 text-gold-400" />
                          <span>{viewModel.location[language]}</span>
                        </motion.div>
                      </div>
                      
                      <div className="flex gap-2 sm:gap-3 shrink-0 self-start">
                        <motion.button
                          type="button"
                          onClick={() => setIsLiked(!isLiked)}
                          className={`p-3 sm:p-4 rounded-xl transition-all ${
                            isLiked 
                              ? 'bg-red-500/20 text-red-500 shadow-lg shadow-red-500/20' 
                              : 'glass text-dark-400 hover:text-white'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <motion.div
                            animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                          </motion.div>
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => void handleShare()}
                          className="p-3 sm:p-4 rounded-xl glass text-dark-400 hover:text-gold-400 transition-colors relative"
                          whileHover={{ scale: 1.1, rotate: 15 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={language === 'ar' ? 'مشاركة المشروع' : 'Share project'}
                        >
                          <Share2 className="w-6 h-6" />
                          {shareNotice ? (
                            <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-2 py-1 rounded-lg bg-dark-900 text-gold-400 border border-gold-500/30">
                              {shareNotice}
                            </span>
                          ) : null}
                        </motion.button>
                      </div>
                    </div>

                    {/* Quick Stats with Animation */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
                      {[
                        { icon: Maximize, value: viewModel.area, label: t('common.sqm') },
                        { icon: Home, value: viewModel.units, label: language === 'ar' ? 'وحدة' : 'Units' },
                        { icon: Calendar, value: viewModel.completionDate, label: language === 'ar' ? 'التسليم' : 'Completion' },
                        { icon: Star, value: 'A+', label: language === 'ar' ? 'التصنيف' : 'Rating' },
                      ].map((stat, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          className="p-3 sm:p-5 rounded-xl bg-dark-800/50 text-center border border-white/5 hover:border-gold-500/30 transition-all cursor-pointer group"
                        >
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                          >
                            <stat.icon className="w-7 h-7 text-gold-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                          </motion.div>
                          <div className="text-lg sm:text-2xl font-bold text-white break-words">{stat.value}</div>
                          <div className="text-sm text-dark-400">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card3D>
              </motion.div>

              {/* Description with Elegant Design */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card3D intensity={3} className="rounded-3xl">
                  <div className="glass rounded-3xl p-4 sm:p-8 border border-white/10 relative overflow-hidden">
                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold-500/10 to-transparent rounded-bl-full" />
                    
                    <motion.h2 
                      className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
                      whileHover={{ x: direction === 'rtl' ? -5 : 5 }}
                    >
                      <Sparkles className="w-6 h-6 text-gold-400" />
                      {language === 'ar' ? 'عن المشروع' : 'About Project'}
                    </motion.h2>
                    <motion.p 
                      className="text-dark-300 leading-relaxed text-lg relative z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {viewModel.description[language]}
                    </motion.p>
                  </div>
                </Card3D>
              </motion.div>

              {/* Features with Advanced Animations */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card3D intensity={3} className="rounded-3xl">
                  <div className="glass rounded-3xl p-4 sm:p-8 border border-white/10">
                    <motion.h2 
                      className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
                      whileHover={{ x: direction === 'rtl' ? -5 : 5 }}
                    >
                      <CheckCircle className="w-6 h-6 text-gold-400" />
                      {language === 'ar' ? 'مميزات المشروع' : 'Project Features'}
                    </motion.h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {viewModel.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: direction === 'rtl' ? 50 : -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 100 }}
                          whileHover={{ scale: 1.02, x: direction === 'rtl' ? -5 : 5 }}
                          className="flex items-center gap-4 p-5 rounded-xl bg-dark-800/50 border border-white/5 hover:border-gold-500/30 transition-all cursor-pointer group"
                        >
                          <motion.div
                            className="p-2 rounded-lg bg-gold-500/20"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <CheckCircle className="w-5 h-5 text-gold-400" />
                          </motion.div>
                          <span className="text-dark-200 group-hover:text-white transition-colors">
                            {feature[language]}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card3D>
              </motion.div>

              {/* Location Map */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-3xl p-4 sm:p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  {language === 'ar' ? 'موقع المشروع' : 'Project Location'}
                </h2>
                <LocationMap
                  mapUrl={project.mapUrl ?? site.mapUrl}
                  query={viewModel.location[language]}
                  openLabel={
                    language === 'ar' ? 'فتح في Google Maps' : 'Open in Google Maps'
                  }
                  loadingLabel={language === 'ar' ? 'جاري تحميل الخريطة' : 'Loading map'}
                  mapPromptLabel={
                    language === 'ar'
                      ? 'اضغط أدناه لفتح الموقع على الخريطة'
                      : 'Tap below to open this location in Google Maps'
                  }
                />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6 min-w-0">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-3xl p-4 sm:p-6 lg:sticky lg:top-24"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600">
                    <FileText className="w-8 h-8 text-dark-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {language === 'ar' ? 'كتيب المشروع' : 'Project Brochure'}
                    </h3>
                    <p className="text-dark-400 text-sm">
                      {viewModel.pdfUrl
                        ? language === 'ar'
                          ? 'ملف PDF'
                          : 'PDF document'
                        : language === 'ar'
                          ? 'لا يتوفر كتيب إلكتروني'
                          : 'No brochure uploaded'}
                    </p>
                  </div>
                </div>

                {viewModel.pdfUrl ? (
                  <motion.a
                    href={viewModel.pdfUrl}
                    download
                    className="w-full py-4 px-6 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold rounded-xl flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-5 h-5" />
                    <span>{t('projects.downloadPdf')}</span>
                  </motion.a>
                ) : (
                  <div className="w-full py-4 px-6 rounded-xl bg-dark-800/60 text-dark-400 text-sm text-center border border-dark-700">
                    {language === 'ar' ? 'سيتم إضافة الكتيب قريباً' : 'Brochure coming soon'}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-dark-700">
                  <h4 className="text-white font-medium mb-4">
                    {language === 'ar' ? 'هل تحتاج مساعدة؟' : 'Need Help?'}
                  </h4>
                  <a
                    href={`tel:${site.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-3 p-4 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-dark-400 text-sm">
                        {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                      </p>
                      <p className="text-white font-medium">{site.phone}</p>
                    </div>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Gallery */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-dark-950/98 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 end-4 sm:top-6 sm:end-6 p-2.5 sm:p-3 rounded-full glass hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
              className="absolute start-2 sm:start-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-4 rounded-full glass hover:bg-white/20 transition-colors z-10"
            >
              {direction === 'rtl' ? (
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              ) : (
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
              className="absolute end-2 sm:end-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-4 rounded-full glass hover:bg-white/20 transition-colors z-10"
            >
              {direction === 'rtl' ? (
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              ) : (
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              )}
            </button>

            {/* Main Image */}
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-full max-h-[70vh] sm:max-h-[80vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={viewModel.images[currentImage]}
                alt=""
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              />
            </motion.div>

            <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex justify-center gap-1.5 px-4 overflow-x-auto">
              {viewModel.images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImage(index);
                  }}
                  className={`shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden transition-all ${
                    currentImage === index ? 'ring-2 ring-gold-500 scale-105' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="absolute bottom-4 end-4 sm:bottom-6 sm:end-6 px-3 py-1.5 glass rounded-xl text-white text-sm">
              {currentImage + 1} / {viewModel.images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer
        site={site}
        footer={footer}
        socialLinks={socialLinks}
        showNewsletter={showNewsletter}
      />
    </main>
  );
}
