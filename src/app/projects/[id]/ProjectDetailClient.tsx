'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/sections/Footer';
import Card3D from '@/components/ui/Card3D';
import ParticleBackground from '@/components/ui/ParticleBackground';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
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
    <main className="min-h-screen bg-slate-100 text-slate-900 dark:bg-dark-950 dark:text-white">
      <Navbar siteName={site.siteName} />

      {/* Hero Image Gallery with Parallax */}
      <section ref={heroRef} className="relative h-[80vh] overflow-hidden">
        {/* Main Image with Parallax */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
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

        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gold-500/40 rounded-full"
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

        {/* Navigation Buttons with Advanced Animation */}
        <motion.button
          onClick={() => navigateImage('prev')}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full glass hover:bg-gold-500/20 transition-all z-10 border border-white/10 hover:border-gold-500/50"
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </motion.button>
        <motion.button
          onClick={() => navigateImage('next')}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full glass hover:bg-gold-500/20 transition-all z-10 border border-white/10 hover:border-gold-500/50"
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </motion.button>

        {/* View All Button with Glow */}
        <motion.button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-28 right-6 flex items-center gap-3 px-6 py-4 glass rounded-2xl text-white hover:bg-gold-500/10 transition-all z-10 border border-white/10 hover:border-gold-500/50"
          whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(212,175,55,0.2)' }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          >
            <ZoomIn className="w-5 h-5" />
          </motion.div>
          <span className="font-medium">{language === 'ar' ? 'عرض الكل' : 'View All'}</span>
          <motion.span 
            className="px-3 py-1 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 rounded-full text-sm font-bold"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {viewModel.images.length}
          </motion.span>
        </motion.button>

        {/* Image Progress Indicator */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {viewModel.images.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentImage(index)}
              className="relative"
              whileHover={{ scale: 1.3 }}
            >
              <div className={`w-2 h-2 rounded-full transition-all ${
                currentImage === index ? 'w-8 bg-gold-500' : 'bg-white/50 hover:bg-white'
              }`} />
            </motion.button>
          ))}
        </div>

        {/* Thumbnails with Advanced Hover */}
        <div className="absolute bottom-8 left-6 flex gap-3 z-10">
          {viewModel.images.slice(0, 5).map((img, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden transition-all ${
                currentImage === index 
                  ? 'ring-3 ring-gold-500 scale-110 shadow-lg shadow-gold-500/30' 
                  : 'opacity-60 hover:opacity-100'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.15, y: -5 }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
              {currentImage === index && (
                <motion.div
                  className="absolute inset-0 border-2 border-gold-500 rounded-xl"
                  layoutId="activeThumb"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Back Button with Animation */}
        <Link href="/#projects">
          <motion.div
            className="absolute top-24 left-6 flex items-center gap-3 text-white glass px-5 py-3 rounded-xl z-10 border border-white/10 hover:border-gold-500/50"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ x: direction === 'rtl' ? 8 : -8, backgroundColor: 'rgba(212,175,55,0.1)' }}
          >
            {direction === 'rtl' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            <span className="font-medium">{language === 'ar' ? 'العودة للمشاريع' : 'Back to Projects'}</span>
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
      <section className="relative -mt-20 z-20 pb-20">
        {/* Background Glow */}
        <motion.div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title Card with 3D Effect */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Card3D intensity={5} className="rounded-3xl">
                  <div className="glass rounded-3xl p-8 border border-white/10">
                    <div className="flex items-start justify-between mb-6">
                      <div>
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
                          className="text-3xl md:text-4xl font-bold text-white"
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
                      
                      <div className="flex gap-3">
                        <motion.button
                          onClick={() => setIsLiked(!isLiked)}
                          className={`p-4 rounded-xl transition-all ${
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
                          className="p-4 rounded-xl glass text-dark-400 hover:text-gold-400 transition-colors"
                          whileHover={{ scale: 1.1, rotate: 15 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Share2 className="w-6 h-6" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Quick Stats with Animation */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
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
                          className="p-5 rounded-xl bg-dark-800/50 text-center border border-white/5 hover:border-gold-500/30 transition-all cursor-pointer group"
                        >
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                          >
                            <stat.icon className="w-7 h-7 text-gold-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                          </motion.div>
                          <div className="text-2xl font-bold text-white">{stat.value}</div>
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
                  <div className="glass rounded-3xl p-8 border border-white/10 relative overflow-hidden">
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
                  <div className="glass rounded-3xl p-8 border border-white/10">
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
                className="glass rounded-3xl p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  {language === 'ar' ? 'موقع المشروع' : 'Project Location'}
                </h2>
                <div className="rounded-2xl overflow-hidden aspect-video">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.7!2d46.6!3d24.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzAwLjAiTiA0NsKwMzYnMDAuMCJF!5e0!3m2!1sen!2ssa!4v1600000000000!5m2!1sen!2ssa"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Download PDF Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-3xl p-6 sticky top-24"
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
            className="fixed inset-0 z-50 bg-dark-950/98 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full glass hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full glass hover:bg-white/20 transition-colors z-10"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full glass hover:bg-white/20 transition-colors z-10"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>

            {/* Main Image */}
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-5xl max-h-[80vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={viewModel.images[currentImage]}
                alt=""
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              />
            </motion.div>

            {/* Thumbnails */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {viewModel.images.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImage(index);
                  }}
                  className={`w-16 h-16 rounded-lg overflow-hidden transition-all ${
                    currentImage === index ? 'ring-2 ring-gold-500 scale-110' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Counter */}
            <div className="absolute bottom-6 right-6 px-4 py-2 glass rounded-xl text-white">
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
