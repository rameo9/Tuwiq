'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCounter } from '@/hooks/useScrollReveal';
import { ChevronDown, Play, ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react';
import MagneticButton from '@/components/ui/MagneticButton';
import type { LandingPayload } from '@/lib/cms-read';
import { parseHeroVideoUrl } from '@/lib/hero-video';

function parseStatParts(val: string): { n: number; suffix: string } {
  const s = String(val);
  const m = s.match(/^(\d+)(.*)$/);
  return { n: m ? parseInt(m[1], 10) : 0, suffix: m ? m[2] : '' };
}

const FALLBACK_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
];

const floatingShapes = [
  { size: 60, x: '10%', y: '20%', delay: 0, duration: 8 },
  { size: 40, x: '80%', y: '30%', delay: 1, duration: 10 },
  { size: 80, x: '70%', y: '70%', delay: 2, duration: 12 },
  { size: 30, x: '20%', y: '80%', delay: 0.5, duration: 9 },
  { size: 50, x: '90%', y: '50%', delay: 1.5, duration: 11 },
];

export default function HeroSection({ hero }: { hero: LandingPayload['hero'] }) {
  const { language, direction } = useLanguage();
  const { colors } = useTheme();
  const [currentImage, setCurrentImage] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const videoSource = parseHeroVideoUrl(hero.videoUrl);
  const { scrollY } = useScroll();
  
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.2]);
  const textY = useTransform(scrollY, [0, 300], [0, 100]);
  const blur = useTransform(scrollY, [0, 500], [0, 10]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const images = hero.images?.length ? hero.images : FALLBACK_HERO_IMAGES;

  const paddedStats = [...hero.stats];
  while (paddedStats.length < 3) {
    paddedStats.push({ value: '0', label: { ar: '', en: '' } });
  }

  const statProjects = paddedStats[0];
  const statClients = paddedStats[1];
  const statYears = paddedStats[2];

  const pp = parseStatParts(statProjects.value);
  const pc = parseStatParts(statClients.value);
  const py = parseStatParts(statYears.value);

  const projectsCounter = useCounter(pp.n, 2500);
  const clientsCounter = useCounter(pc.n, 2500);
  const yearsCounter = useCounter(py.n, 2000);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x * 30);
        mouseY.set(y * 30);
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleScroll = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <section 
      ref={heroRef}
      id="home" 
      className="relative min-h-[100dvh] flex flex-col overflow-hidden"
    >
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y, scale }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.2, rotateZ: 2 }}
            animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotateZ: -2 }}
            transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <motion.div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${images[currentImage]})`,
                x: smoothMouseX,
                y: smoothMouseY,
              }}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Multi-layer Overlays for Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-100 dark:from-dark-950/80 dark:via-dark-950/40 dark:to-dark-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 via-transparent to-slate-900/30 dark:from-dark-950/60 dark:via-transparent dark:to-dark-950/60" />
        <motion.div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle, ${colors.primary}10 0%, transparent 70%)`
          }}
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <motion.div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(${colors.primary}1A 1px, transparent 1px),
                linear-gradient(90deg, ${colors.primary}1A 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
            animate={{ 
              backgroundPosition: ['0px 0px', '80px 80px'],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Floating Light Beams */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-[200%]"
            style={{ 
              left: `${20 + i * 30}%`, 
              top: '-50%',
              background: `linear-gradient(to bottom, transparent, ${colors.primary}33, transparent)`
            }}
            animate={{
              y: ['-100%', '100%'],
              opacity: [0, 0.5, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 2,
            }}
          />
        ))}

        {/* Floating Geometric Shapes */}
        {floatingShapes.map((shape, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: shape.size,
              height: shape.size,
              left: shape.x,
              top: shape.y,
              borderRadius: i % 2 === 0 ? '50%' : '20%',
              border: `1px solid ${colors.primary}33`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: shape.delay,
            }}
          />
        ))}
      </motion.div>

      {/* Dynamic Spotlight following mouse */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${colors.primary}10, transparent 40%)`,
        }}
      />

      {/* Content */}
      <motion.div 
        className="relative z-10 flex-1 flex flex-col justify-center pt-20 md:pt-24 pb-2"
        style={{ opacity, y: textY }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Animated Badge */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass mb-4 sm:mb-6"
                style={{ borderColor: `${colors.primary}33`, borderWidth: 1 }}
                whileHover={{ scale: 1.05, borderColor: `${colors.primary}80` }}
                animate={{
                  boxShadow: [
                    `0 0 20px ${colors.primary}00`,
                    `0 0 40px ${colors.primary}33`,
                    `0 0 20px ${colors.primary}00`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: colors.primary }} />
                </motion.div>
                <span className="font-semibold tracking-wider" style={{ color: colors.primary }}>
                  {hero.subtitle[language]}
                </span>
                <motion.span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>

            {/* Title */}
            <div className="mb-3 sm:mb-6">
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900 drop-shadow-sm dark:text-white dark:drop-shadow-none px-1"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {hero.title[language]}
              </motion.h1>
            </div>

            {/* Animated Underline */}
            <motion.div
              className="h-1 mx-auto mb-4 sm:mb-6 rounded-full"
              style={{ background: `linear-gradient(to right, transparent, ${colors.primary}, transparent)` }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '60%', opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            />

            {/* Description with Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <p className="text-base sm:text-xl md:text-2xl text-slate-600 dark:text-dark-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-1">
                {hero.description[language]}
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-md sm:max-w-none mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
            >
              <motion.button
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-dark-900 font-bold rounded-xl shadow-lg flex items-center justify-center gap-3"
                style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{hero.ctaText[language]}</span>
                {direction === 'rtl' ? (
                  <ArrowLeft className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </motion.button>

              {videoSource && (
                <motion.button
                  type="button"
                  onClick={() => setVideoOpen(true)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 glass text-slate-800 font-semibold rounded-xl flex items-center justify-center gap-3 border border-slate-300/80 dark:border-white/20 dark:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${colors.primary}33` }}
                  >
                    <Play className="w-4 h-4 fill-current" style={{ color: colors.primary }} />
                  </div>
                  <span>{language === 'ar' ? 'شاهد الفيديو' : 'Watch Video'}</span>
                </motion.button>
              )}
            </motion.div>

            {/* Stats — in document flow (no overlap with buttons) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.2 }}
              className="max-w-xl mx-auto"
            >
              <div className="glass rounded-2xl py-4 px-4 sm:py-5 sm:px-6" dir="ltr">
                <div className="flex justify-between items-center gap-2">
                  <div ref={yearsCounter.ref} className="text-center flex-1 min-w-0">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold truncate" style={{ color: colors.primary }}>
                      +{yearsCounter.count}{py.suffix}
                    </div>
                    <p className="text-slate-600 dark:text-dark-400 text-[10px] sm:text-xs mt-1 leading-tight" dir="rtl">
                      {statYears.label[language]}
                    </p>
                  </div>
                  <div ref={clientsCounter.ref} className="text-center flex-1 min-w-0">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold truncate" style={{ color: colors.primary }}>
                      +{clientsCounter.count}{pc.suffix}
                    </div>
                    <p className="text-slate-600 dark:text-dark-400 text-[10px] sm:text-xs mt-1 leading-tight" dir="rtl">
                      {statClients.label[language]}
                    </p>
                  </div>
                  <div ref={projectsCounter.ref} className="text-center flex-1 min-w-0">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold truncate" style={{ color: colors.primary }}>
                      +{projectsCounter.count}{pp.suffix}
                    </div>
                    <p className="text-slate-600 dark:text-dark-400 text-[10px] sm:text-xs mt-1 leading-tight" dir="rtl">
                      {statProjects.label[language]}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {videoOpen && videoSource && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4"
              onClick={() => setVideoOpen(false)}
            >
              <button
                type="button"
                aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
                className="absolute top-4 end-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={() => setVideoOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {videoSource.kind === 'youtube' ? (
                  <iframe
                    src={videoSource.embedUrl}
                    title={language === 'ar' ? 'فيديو تعريفي' : 'Promo video'}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={videoSource.src} controls autoPlay className="w-full h-full" />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom: scroll hint + slide dots */}
        <div className="shrink-0 pb-5 pt-3 sm:pb-6">
          <div className="container mx-auto px-4 flex items-center justify-between gap-4">
            <div className="hidden sm:flex gap-2 min-w-[4rem]">
              {images.map((_, index) => (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImage(index)}
                  className="relative"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Slide ${index + 1}`}
                >
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: index === currentImage ? colors.primary : 'rgba(255,255,255,0.3)',
                    }}
                  />
                </motion.button>
              ))}
            </div>

            <motion.div
              className="flex-1 flex justify-center cursor-pointer"
              onClick={handleScroll}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              <motion.div
                className="flex flex-col items-center gap-2"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.span
                  className="text-slate-500 dark:text-dark-500 text-[10px] sm:text-xs tracking-[0.2em] uppercase"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {language === 'ar' ? 'اكتشف المزيد' : 'Discover'}
                </motion.span>
                <motion.div
                  className="w-5 h-8 sm:w-6 sm:h-10 rounded-full flex justify-center pt-1.5 sm:pt-2"
                  style={{ border: `2px solid ${colors.primary}80` }}
                >
                  <motion.div
                    className="w-1 h-2 sm:w-1.5 sm:h-3 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                    animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            <div className="flex sm:hidden gap-1.5 min-w-[4rem] justify-end">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImage(index)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    backgroundColor: index === currentImage ? colors.primary : 'rgba(255,255,255,0.35)',
                  }}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative Orbiting Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          className="w-[600px] h-[600px] rounded-full"
          style={{ border: `1px solid ${colors.primary}1A` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
            style={{ backgroundColor: `${colors.primary}80` }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ border: `1px solid ${colors.primary}0D` }}
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full"
            style={{ backgroundColor: `${colors.primary}4D` }}
          />
        </motion.div>
      </div>
    </section>
  );
}
