'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Building2, MessageSquare, Settings, TrendingUp, ArrowRight, ArrowLeft, Sparkles, Star } from 'lucide-react';
import Card3D from '@/components/ui/Card3D';

const SERVICE_ACCENTS = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-purple-500 to-purple-600',
  'from-gold-500 to-gold-600',
];

type CmsServiceRow = {
  slug: string;
  iconId: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl: string;
};

export default function ServicesSection({
  cmsServices,
}: {
  cmsServices: CmsServiceRow[];
}) {
  const { t, language, direction } = useLanguage();
  const { colors } = useTheme();
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const services = useMemo(() => {
    const iconMap: Record<string, typeof Building2> = {
      building: Building2,
      message: MessageSquare,
      settings: Settings,
      trending: TrendingUp,
    };
    return cmsServices.map((s, i) => ({
      key: s.slug,
      icon: iconMap[s.iconId] ?? Building2,
      color: SERVICE_ACCENTS[i % SERVICE_ACCENTS.length],
      image: s.imageUrl,
      titleAr: s.titleAr,
      titleEn: s.titleEn,
      descriptionAr: s.descriptionAr,
      descriptionEn: s.descriptionEn,
    }));
  }, [cmsServices]);

  const [activeService, setActiveService] = useState(() => cmsServices[0]?.slug ?? '');

  useEffect(() => {
    setActiveService((prev) =>
      services.some((s) => s.key === prev) ? prev : services[0]?.key ?? '',
    );
  }, [services]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <section ref={sectionRef} id="services" className="relative py-32 overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 bg-slate-100 dark:bg-dark-950"
        style={{ y: backgroundY }}
      />
      
      {/* Animated Lines */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)',
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-full h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)',
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.3 }}
      />

      {/* Animated Background Orbs */}
      <motion.div
        className="absolute top-1/4 left-0 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
        }}
        animate={{
          x: [-100, 100, -100],
          y: [-50, 50, -50],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
        }}
        animate={{
          x: [100, -100, 100],
          y: [50, -50, 50],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gold-500/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 4,
          }}
        />
      ))}

      <div className="container mx-auto px-6 relative z-10">
        {/* Header with Epic Animation */}
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
              <Star className="w-4 h-4" />
              {t('services.subtitle')}
            </motion.span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('services.title')}
          </motion.h2>
        </div>

        {/* Services Grid with Advanced Animations */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Service Cards */}
          <div className="space-y-6">
            {services.map((service, index) => (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, x: direction === 'rtl' ? 100 : -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.15,
                  type: 'spring',
                  stiffness: 100,
                }}
              >
                <Card3D className="rounded-2xl" intensity={8}>
                  <motion.div
                    onMouseEnter={() => setHoveredService(service.key)}
                    onMouseLeave={() => setHoveredService(null)}
                    onClick={() => setActiveService(service.key)}
                    className={`relative p-7 rounded-2xl cursor-pointer transition-all duration-500 border ${
                      activeService === service.key
                        ? 'bg-amber-50/90 border-gold-500/50 shadow-lg shadow-gold-500/10 dark:bg-white/10'
                        : 'bg-white/90 border-slate-200/80 hover:border-gold-500/40 dark:bg-dark-900/50 dark:border-white/5 dark:hover:border-gold-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-6">
                      {/* Animated Icon */}
                      <motion.div
                        className={`p-5 rounded-2xl bg-gradient-to-br ${service.color} shadow-lg`}
                        animate={{
                          scale: activeService === service.key ? 1.15 : 1,
                          rotate: hoveredService === service.key ? [0, -5, 5, 0] : 0,
                          boxShadow: activeService === service.key 
                            ? '0 20px 40px rgba(0,0,0,0.3)'
                            : '0 10px 20px rgba(0,0,0,0.2)',
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        <service.icon className="w-8 h-8 text-white" />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1">
                        <motion.h3 
                          className="text-xl font-bold text-slate-900 dark:text-white mb-3"
                          animate={{
                            color: activeService === service.key ? '#d4af37' : '#ffffff',
                          }}
                        >
                          {language === 'ar' ? service.titleAr : service.titleEn}
                        </motion.h3>
                        <p className="text-slate-600 dark:text-dark-400 leading-relaxed">
                          {language === 'ar' ? service.descriptionAr : service.descriptionEn}
                        </p>
                        
                        {/* Learn More Link with Animation */}
                        <motion.div
                          className="flex items-center gap-3 mt-5"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: activeService === service.key ? 1 : 0,
                            y: activeService === service.key ? 0 : 20,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-gold-400 font-semibold">{t('common.learnMore')}</span>
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            {direction === 'rtl' ? (
                              <ArrowLeft className="w-5 h-5 text-gold-400" />
                            ) : (
                              <ArrowRight className="w-5 h-5 text-gold-400" />
                            )}
                          </motion.div>
                        </motion.div>

                        {/* Progress Bar */}
                        <motion.div
                          className="h-0.5 bg-gradient-to-r from-gold-500 to-gold-600 mt-5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: activeService === service.key ? '100%' : '0%',
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>

                      {/* Active Indicator */}
                      <motion.div
                        className={`w-1.5 h-full absolute ${direction === 'rtl' ? 'right-0' : 'left-0'} top-0 rounded-full bg-gradient-to-b ${service.color}`}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: activeService === service.key ? 1 : 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>

                    {/* Hover Glow Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      animate={{
                        boxShadow: hoveredService === service.key 
                          ? 'inset 0 0 40px rgba(212,175,55,0.1)'
                          : 'inset 0 0 0px rgba(212,175,55,0)',
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </Card3D>
              </motion.div>
            ))}
          </div>

          {/* Service Image with Advanced Effects */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: direction === 'rtl' ? -100 : 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              className="relative rounded-3xl overflow-hidden aspect-square"
              whileHover={{ scale: 1.02 }}
              style={{ transformPerspective: 1000 }}
            >
              {/* Background Glow */}
              <motion.div
                className="absolute -inset-10 bg-gradient-to-r from-gold-500/20 to-blue-500/20 blur-3xl"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />

              {/* Images with Crossfade */}
              {services.map((service) => (
                <motion.div
                  key={service.key}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ 
                    opacity: activeService === service.key ? 1 : 0,
                    scale: activeService === service.key ? 1 : 1.2,
                  }}
                  transition={{ duration: 0.8 }}
                >
                  <img
                    src={service.image}
                    alt={language === 'ar' ? service.titleAr : service.titleEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent dark:from-dark-950 dark:via-dark-950/40" />
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-transparent mix-blend-overlay" />
                </motion.div>
              ))}

              {/* Animated Scan Line */}
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent"
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />

              {/* Floating Stats Card */}
              <motion.div
                className="absolute bottom-8 left-8 right-8 glass rounded-2xl p-6 border border-gold-500/20"
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
              >
                <div className="grid grid-cols-3 gap-6 text-center">
                  {[
                    { value: '98%', label: language === 'ar' ? 'رضا العملاء' : 'Satisfaction' },
                    { value: '150+', label: language === 'ar' ? 'مشروع ناجح' : 'Projects' },
                    { value: '24/7', label: language === 'ar' ? 'دعم متواصل' : 'Support' },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.div 
                        className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      >
                        {stat.value}
                      </motion.div>
                      <div className="text-xs text-slate-600 dark:text-dark-400 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Decorative Orbiting Elements */}
            <motion.div
              className="absolute -top-8 -left-8 w-28 h-28 border-2 border-gold-500/30 rounded-2xl"
              animate={{ 
                rotate: [0, 90, 180, 270, 360],
                borderRadius: ['20%', '50%', '20%', '50%', '20%'],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute -bottom-8 -right-8 w-36 h-36 border-2 border-gold-500/20 rounded-full"
              animate={{ scale: [1, 1.2, 1], rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />

            {/* Corner Accents */}
            <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-gold-500/50 rounded-tl-xl" />
            <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-gold-500/50 rounded-tr-xl" />
            <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-gold-500/50 rounded-bl-xl" />
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-gold-500/50 rounded-br-xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
