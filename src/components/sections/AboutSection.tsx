'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Eye, Target, Heart, Award, Building2, Users, TrendingUp, Zap } from 'lucide-react';
import Card3D from '@/components/ui/Card3D';
import type { LandingPayload } from '@/lib/cms-read';

const featureMeta = [
  { icon: Eye, color: 'from-blue-500 to-cyan-500' },
  { icon: Target, color: 'from-purple-500 to-pink-500' },
  { icon: Heart, color: 'from-gold-500 to-orange-500' },
];

const achievements = [
  { icon: Building2, value: 150, suffix: '+', label: { ar: 'مشروع', en: 'Projects' } },
  { icon: Users, value: 500, suffix: '+', label: { ar: 'عميل', en: 'Clients' } },
  { icon: Award, value: 25, suffix: '+', label: { ar: 'جائزة', en: 'Awards' } },
  { icon: TrendingUp, value: 15, suffix: '+', label: { ar: 'سنة', en: 'Years' } },
];

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function AboutSection({ about }: { about: LandingPayload['about'] }) {
  const { language, direction } = useLanguage();
  const { colors } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);

  return (
    <section 
      ref={containerRef}
      id="about" 
      className="relative py-32 overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950" />
      
      {/* Animated Lines */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)',
          scaleX: scrollYProgress,
        }}
      />
      
      {/* Floating Orbs with Parallax */}
      <motion.div
        className="absolute top-20 right-20 w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
          y: y1,
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
          y: y2,
        }}
      />

      {/* Geometric Pattern */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute border border-gold-500/20"
            style={{
              width: 100 + i * 50,
              height: 100 + i * 50,
              borderRadius: i % 2 === 0 ? '50%' : '20%',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 30 + i * 5, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Content */}
          <div className={direction === 'rtl' ? 'lg:order-1' : 'lg:order-2'}>
            {/* Section Badge */}
            <motion.div
              initial={{ opacity: 0, x: direction === 'rtl' ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.span 
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-gold-500/20 to-gold-600/10 text-gold-400 text-sm font-semibold mb-6 border border-gold-500/20"
                whileHover={{ scale: 1.05 }}
              >
                <Zap className="w-4 h-4" />
                {about.subtitle[language]}
              </motion.span>
            </motion.div>

            {/* Animated Title */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900 dark:text-white"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {about.title[language]}
              </motion.h2>
            </motion.div>

            {/* Description */}
            <motion.p 
              className="text-xl text-slate-600 dark:text-dark-300 leading-relaxed mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {about.description[language]}
            </motion.p>

            {/* Features with 3D Cards */}
            <div className="space-y-5">
              {featureMeta.map((meta, index) => {
                const cms = about.features[index];
                if (!cms) return null;
                const Icon = meta.icon;
                return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: direction === 'rtl' ? 100 : -100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.8 + index * 0.15,
                    type: 'spring',
                    stiffness: 100,
                  }}
                >
                  <Card3D className="rounded-2xl">
                    <motion.div 
                      className="flex items-start gap-5 p-6 rounded-2xl glass border border-slate-200/80 hover:border-gold-500/40 dark:border-white/5 dark:hover:border-gold-500/30 transition-all duration-500 group cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Animated Icon */}
                      <motion.div 
                        className={`p-4 rounded-2xl bg-gradient-to-br ${meta.color} shadow-lg`}
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <motion.h3 
                          className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors"
                        >
                          {cms.title[language]}
                        </motion.h3>
                        <p className="text-slate-600 dark:text-dark-400 leading-relaxed">
                          {cms.text[language]}
                        </p>
                        
                        {/* Animated Line */}
                        <motion.div
                          className="h-0.5 bg-gradient-to-r from-gold-500 to-transparent mt-4"
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 1 + index * 0.2 }}
                        />
                      </div>
                    </motion.div>
                  </Card3D>
                </motion.div>
                );
              })}
            </div>
          </div>

          {/* Visual Section */}
          <motion.div 
            className={direction === 'rtl' ? 'lg:order-2' : 'lg:order-1'}
            style={{ scale }}
          >
            <div className="relative">
              {/* Main Image with 3D Effect */}
              <motion.div 
                className="relative rounded-3xl overflow-hidden aspect-[4/5]"
                style={{ rotateY: rotate }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5 }}
              >
                <motion.img
                  src={about.image}
                  alt={about.title[language]}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.2 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5 }}
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent dark:from-dark-950 dark:via-dark-950/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-transparent mix-blend-overlay" />
                
                {/* Animated Scan Line */}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent"
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                
                {/* Stats Overlay */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 p-8"
                  initial={{ y: 100, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <div className="glass rounded-2xl p-6 border border-slate-200/80 dark:border-white/10">
                    <div className="grid grid-cols-4 gap-4">
                      {achievements.map((item, index) => (
                        <motion.div 
                          key={index} 
                          className="text-center group"
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <item.icon className="w-6 h-6 text-gold-400 mx-auto mb-2" />
                          </motion.div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            <AnimatedCounter value={item.value} suffix={item.suffix} />
                          </div>
                          <div className="text-xs text-slate-600 dark:text-dark-400">{item.label[language]}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating Decorative Elements */}
              <motion.div
                className="absolute -top-8 -right-8 w-32 h-32 border-2 border-gold-500/30 rounded-3xl"
                animate={{ 
                  rotate: [0, 90, 180, 270, 360],
                  borderRadius: ['30%', '50%', '30%', '50%', '30%'],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute -bottom-8 -left-8 w-40 h-40 border-2 border-gold-500/20 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              {/* Floating Badge */}
              <motion.div
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 glass rounded-full px-8 py-4 border border-gold-500/30"
                animate={{ 
                  y: [0, -15, 0],
                  boxShadow: [
                    '0 0 20px rgba(212,175,55,0.2)',
                    '0 0 40px rgba(212,175,55,0.4)',
                    '0 0 20px rgba(212,175,55,0.2)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-gold-400 font-bold flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🏆
                  </motion.span>
                  {language === 'ar' ? 'الأفضل في المنطقة' : 'Best in Region'}
                </span>
              </motion.div>

              {/* Corner Accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gold-500/50 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gold-500/50 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gold-500/50 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gold-500/50 rounded-br-lg" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
