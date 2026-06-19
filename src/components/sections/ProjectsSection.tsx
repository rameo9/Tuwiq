'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MapPin, Maximize, Home, ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Card3D from '@/components/ui/Card3D';
import { shareSubtitleFromLocation } from '@/lib/share-project';

type CmsProjectRow = {
  id: number;
  titleAr: string;
  titleEn: string;
  locationAr: string;
  locationEn: string;
  area: string;
  units: string;
  categoryAr: string;
  categoryEn: string;
  mainImageUrl: string;
};

export default function ProjectsSection({ cmsProjects }: { cmsProjects: CmsProjectRow[] }) {
  const { t, language, direction } = useLanguage();
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const cardProjects = useMemo(
    () =>
      cmsProjects.map((p) => ({
        id: p.id,
        title: { ar: p.titleAr, en: p.titleEn },
        location: {
          ar: shareSubtitleFromLocation(p.locationAr),
          en: shareSubtitleFromLocation(p.locationEn),
        },
        area: p.area,
        units: p.units,
        image: p.mainImageUrl,
        category: { ar: p.categoryAr, en: p.categoryEn },
      })),
    [cmsProjects],
  );

  const categoryOptions = useMemo(() => {
    const uniq: { ar: string; en: string }[] = [];
    const keys = new Set<string>();
    cmsProjects.forEach((p) => {
      const k = `${p.categoryAr}|${p.categoryEn}`;
      if (!keys.has(k)) {
        keys.add(k);
        uniq.push({ ar: p.categoryAr, en: p.categoryEn });
      }
    });
    return [{ ar: 'الكل', en: 'All' }, ...uniq];
  }, [cmsProjects]);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const filteredProjects = activeCategory === 'الكل' || activeCategory === 'All'
    ? cardProjects
    : cardProjects.filter((p) => p.category[language] === activeCategory);

  return (
    <section ref={sectionRef} id="projects" className="relative py-32 overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 bg-slate-100 dark:bg-dark-950"
        style={{ y: backgroundY }}
      />
      <div className="absolute inset-0">
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gold-500/50 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}

      <div className="container mx-auto px-6 relative z-10">
        {/* Header with Reveal Animation */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-gold-500/20 to-gold-600/10 text-gold-400 text-sm font-semibold mb-6 border border-gold-500/20"
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(212,175,55,0)',
                  '0 0 40px rgba(212,175,55,0.3)',
                  '0 0 20px rgba(212,175,55,0)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4" />
              {t('projects.subtitle')}
            </motion.span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900 dark:text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('projects.title')}
          </motion.h2>

          {/* Animated Category Filter */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {categoryOptions.map((cat, index) => (
              <motion.button
                key={`${cat.ar}-${cat.en}`}
                onClick={() => setActiveCategory(cat[language])}
                className={`relative px-8 py-3 rounded-full text-sm font-semibold overflow-hidden transition-all duration-500 ${
                  activeCategory === cat[language]
                    ? 'text-dark-900'
                    : 'text-slate-600 hover:text-slate-900 dark:text-dark-300 dark:hover:text-white'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gold-500 to-gold-600"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: activeCategory === cat[language] ? 1 : 0,
                    opacity: activeCategory === cat[language] ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ borderRadius: '9999px' }}
                />
                <motion.div
                  className="absolute inset-0 glass border border-white/10"
                  initial={{ opacity: 1 }}
                  animate={{ 
                    opacity: activeCategory === cat[language] ? 0 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ borderRadius: '9999px' }}
                />
                <span className="relative z-10">{cat[language]}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Projects Grid with Stagger Animation */}
        <motion.div 
          layout
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 100, rotateX: -30 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateX: 30 }}
                transition={{ 
                  duration: 0.7, 
                  delay: index * 0.15,
                  type: 'spring',
                  stiffness: 100,
                }}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                className="group"
                style={{ transformPerspective: 1000 }}
              >
                <Link href={`/projects/${project.id}`}>
                  <Card3D className="rounded-3xl" intensity={10}>
                    <div className="relative rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer bg-slate-200 dark:bg-dark-900">
                      {/* Image with Parallax */}
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          scale: hoveredProject === project.id ? 1.15 : 1,
                        }}
                        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                      >
                        <img
                          src={project.image}
                          alt={project.title[language]}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>

                      {/* Multi-layer Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent dark:from-dark-950 dark:via-dark-950/40" />
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-b from-gold-500/0 to-gold-500/0"
                        animate={{
                          background: hoveredProject === project.id 
                            ? 'linear-gradient(to bottom, rgba(212,175,55,0.1), rgba(212,175,55,0.2))'
                            : 'linear-gradient(to bottom, rgba(212,175,55,0), rgba(212,175,55,0))',
                        }}
                        transition={{ duration: 0.5 }}
                      />
                      
                      {/* Category Badge with Glow */}
                      <motion.div
                        className="absolute top-5 right-5 px-5 py-2 rounded-full glass text-sm font-semibold text-gold-400 border border-gold-500/30"
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{
                          boxShadow: '0 0 30px rgba(212,175,55,0.5)',
                          scale: 1.1,
                        }}
                      >
                        {project.category[language]}
                      </motion.div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <motion.div
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                        >
                          <motion.h3 
                            className="text-2xl font-bold text-white mb-3 drop-shadow-sm"
                            animate={{
                              textShadow: hoveredProject === project.id 
                                ? '0 0 20px rgba(255,255,255,0.3)'
                                : '0 0 0px rgba(255,255,255,0)',
                            }}
                          >
                            {project.title[language]}
                          </motion.h3>
                          
                          {project.location[language] ? (
                          <motion.div 
                            className="flex items-center gap-2 text-slate-300 dark:text-dark-400 mb-4"
                            animate={{
                              x: hoveredProject === project.id ? 10 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div
                              animate={{ rotate: hoveredProject === project.id ? 360 : 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              <MapPin className="w-5 h-5 text-gold-400" />
                            </motion.div>
                            <span className="text-sm">{project.location[language]}</span>
                          </motion.div>
                          ) : null}

                          {/* Stats with Slide Animation */}
                          <motion.div 
                            className="flex items-center gap-6 text-sm"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ 
                              opacity: hoveredProject === project.id ? 1 : 0,
                              height: hoveredProject === project.id ? 'auto' : 0,
                            }}
                            transition={{ duration: 0.4 }}
                          >
                            <motion.div 
                              className="flex items-center gap-2 text-slate-800 dark:text-dark-300 glass px-4 py-2 rounded-lg"
                              initial={{ x: -20 }}
                              animate={{ x: hoveredProject === project.id ? 0 : -20 }}
                            >
                              <Maximize className="w-4 h-4 text-gold-400" />
                              <span>{project.area} {t('common.sqm')}</span>
                            </motion.div>
                            <motion.div 
                              className="flex items-center gap-2 text-slate-800 dark:text-dark-300 glass px-4 py-2 rounded-lg"
                              initial={{ x: 20 }}
                              animate={{ x: hoveredProject === project.id ? 0 : 20 }}
                            >
                              <Home className="w-4 h-4 text-gold-400" />
                              <span>{project.units} {language === 'ar' ? 'وحدة' : 'units'}</span>
                            </motion.div>
                          </motion.div>
                        </motion.div>

                        {/* View Button */}
                        <motion.div
                          className="mt-6"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ 
                            opacity: hoveredProject === project.id ? 1 : 0,
                            y: hoveredProject === project.id ? 0 : 30,
                          }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          <motion.span 
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold text-sm shadow-lg shadow-gold-500/30"
                            whileHover={{ scale: 1.05, gap: '1rem' }}
                          >
                            {t('projects.viewDetails')}
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <ArrowUpRight className="w-5 h-5" />
                            </motion.div>
                          </motion.span>
                        </motion.div>
                      </div>

                      {/* Animated Border */}
                      <motion.div
                        className="absolute inset-0 rounded-3xl border-2 border-gold-500/0"
                        animate={{
                          borderColor: hoveredProject === project.id 
                            ? 'rgba(212,175,55,0.5)'
                            : 'rgba(212,175,55,0)',
                        }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Corner Accents */}
                      <motion.div
                        className={`absolute top-0 w-24 h-24 border-t-2 border-gold-500 ${
                          direction === 'rtl'
                            ? 'right-0 border-r-2 rounded-tr-3xl'
                            : 'left-0 border-l-2 rounded-tl-3xl'
                        }`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: hoveredProject === project.id ? 1 : 0,
                          opacity: hoveredProject === project.id ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div
                        className={`absolute bottom-0 w-24 h-24 border-b-2 border-gold-500 ${
                          direction === 'rtl'
                            ? 'left-0 border-l-2 rounded-bl-3xl'
                            : 'right-0 border-r-2 rounded-br-3xl'
                        }`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: hoveredProject === project.id ? 1 : 0,
                          opacity: hoveredProject === project.id ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </Card3D>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View All Button */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.button
            className="group relative inline-flex items-center gap-4 px-10 py-5 rounded-2xl glass text-slate-900 dark:text-white font-semibold border border-slate-200/80 dark:border-white/10 overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: 'rgba(212,175,55,0.5)' }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-gold-500/0 via-gold-500/20 to-gold-500/0"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="relative z-10">{t('projects.viewAll')}</span>
            <motion.div
              className="relative z-10"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {direction === 'rtl' ? (
                <ChevronLeft className="w-6 h-6 text-gold-400" />
              ) : (
                <ChevronRight className="w-6 h-6 text-gold-400" />
              )}
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
