'use client';

import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Heart, ArrowUp, Send, Sparkles } from 'lucide-react';
import SiteLogo from '@/components/ui/SiteLogo';
import type { LandingPayload, SitePayload } from '@/lib/cms-read';
import { getSocialHref, getSocialIcon } from '@/lib/social';

const quickLinks = {
  ar: ['الرئيسية', 'من نحن', 'مشاريعنا', 'خدماتنا', 'المعرض', 'تواصل معنا'],
  en: ['Home', 'About Us', 'Projects', 'Services', 'Gallery', 'Contact'],
};

const services = {
  ar: ['التطوير العقاري', 'الاستشارات', 'إدارة الممتلكات', 'الاستثمار'],
  en: ['Real Estate Development', 'Consulting', 'Property Management', 'Investment'],
};

export default function Footer({
  site,
  footer,
  socialLinks,
  showNewsletter,
}: {
  site: SitePayload;
  footer: LandingPayload['footer'];
  socialLinks: Array<{ platform: string; url: string }>;
  showNewsletter: boolean;
}) {
  const { t, language, direction } = useLanguage();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('fail');
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    } catch {
      window.alert(
        language === 'ar'
          ? 'تعذر تسجيل البريد. حاول لاحقاً.'
          : 'Could not subscribe. Try again later.',
      );
    }
  };

  return (
    <footer className="relative bg-slate-100 dark:bg-dark-950 overflow-hidden">
      {/* Animated Top Gradient Line */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.8), transparent)',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Animated Decorative Elements */}
      <motion.div 
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -50, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating Particles */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gold-500/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      <div className="container mx-auto px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-1"
          >
            <motion.div className="mb-6" whileHover={{ scale: 1.03 }}>
              <SiteLogo
                logo={site.logo}
                siteName={site.siteName}
                language={language}
                imageClassName="h-12 sm:h-14 w-auto object-contain"
              />
            </motion.div>
            <p className="text-slate-600 dark:text-dark-400 mb-6 leading-relaxed">
              {footer.companyBlurb[language]}
            </p>
            
            {/* Social Links with Advanced Animation */}
            <div className="flex gap-3">
              {socialLinks
                .filter((s) => s.url.trim())
                .map((s, index) => {
                  const Icon = getSocialIcon(s.platform);
                  const href = getSocialHref(s.platform, s.url);
                  return (
                <motion.a
                  key={`${s.platform}-footer-${index}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.2, y: -5 }}
                  className="p-3 rounded-xl bg-slate-200 hover:bg-gold-500 text-slate-600 hover:text-dark-900 transition-all duration-300 shadow-lg dark:bg-dark-800 dark:text-dark-400"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
                  );
                })}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            <motion.h4 
              className="text-slate-900 dark:text-white font-bold text-lg mb-6 flex items-center gap-2"
              whileHover={{ x: direction === 'rtl' ? -5 : 5 }}
            >
              <Sparkles className="w-4 h-4 text-gold-500" />
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </motion.h4>
            <ul className="space-y-4">
              {quickLinks[language].map((link, index) => {
                const linkId = `quick-${index}`;
                return (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: direction === 'rtl' ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    <motion.a
                      href={`#${['home', 'about', 'projects', 'services', 'gallery', 'contact'][index]}`}
                      className="text-slate-600 dark:text-dark-400 transition-colors inline-flex items-center gap-3 group"
                      onMouseEnter={() => setHoveredLink(linkId)}
                      onMouseLeave={() => setHoveredLink(null)}
                      whileHover={{ x: direction === 'rtl' ? -8 : 8 }}
                    >
                      <motion.span 
                        className="w-2 h-2 rounded-full bg-gold-500"
                        animate={{
                          scale: hoveredLink === linkId ? 1.5 : 1,
                          boxShadow: hoveredLink === linkId ? '0 0 10px rgba(212,175,55,0.5)' : '0 0 0px rgba(212,175,55,0)',
                        }}
                      />
                      <span className={hoveredLink === linkId ? 'text-gold-400' : ''}>
                        {link}
                      </span>
                    </motion.a>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <motion.h4 
              className="text-slate-900 dark:text-white font-bold text-lg mb-6 flex items-center gap-2"
              whileHover={{ x: direction === 'rtl' ? -5 : 5 }}
            >
              <Sparkles className="w-4 h-4 text-gold-500" />
              {language === 'ar' ? 'خدماتنا' : 'Our Services'}
            </motion.h4>
            <ul className="space-y-4">
              {services[language].map((service, index) => {
                const serviceId = `service-${index}`;
                return (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: direction === 'rtl' ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <motion.a
                      href="#services"
                      className="text-slate-600 dark:text-dark-400 transition-colors inline-flex items-center gap-3 group"
                      onMouseEnter={() => setHoveredLink(serviceId)}
                      onMouseLeave={() => setHoveredLink(null)}
                      whileHover={{ x: direction === 'rtl' ? -8 : 8 }}
                    >
                      <motion.span 
                        className="w-2 h-2 rounded-full bg-gold-500"
                        animate={{
                          scale: hoveredLink === serviceId ? 1.5 : 1,
                          boxShadow: hoveredLink === serviceId ? '0 0 10px rgba(212,175,55,0.5)' : '0 0 0px rgba(212,175,55,0)',
                        }}
                      />
                      <span className={hoveredLink === serviceId ? 'text-gold-400' : ''}>
                        {service}
                      </span>
                    </motion.a>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>

          {showNewsletter && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.h4 
              className="text-slate-900 dark:text-white font-bold text-lg mb-6 flex items-center gap-2"
              whileHover={{ x: direction === 'rtl' ? -5 : 5 }}
            >
              <Sparkles className="w-4 h-4 text-gold-500" />
              {language === 'ar' ? 'النشرة البريدية' : 'Newsletter'}
            </motion.h4>
            <p className="text-slate-600 dark:text-dark-400 mb-4 text-sm">
              {language === 'ar'
                ? 'اشترك للحصول على آخر الأخبار والعروض'
                : 'Subscribe to get the latest news and offers'}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Your email'}
                  className="w-full px-5 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/20 transition-all dark:bg-dark-800/80 dark:border-dark-700 dark:text-white dark:placeholder-dark-500"
                />
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  animate={{
                    boxShadow: email ? '0 0 20px rgba(212,175,55,0.1)' : '0 0 0px rgba(212,175,55,0)',
                  }}
                />
              </motion.div>
              <motion.button
                type="submit"
                className="relative w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold rounded-xl flex items-center justify-center gap-2 overflow-hidden"
                whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                {isSubscribed ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    ✓ {language === 'ar' ? 'تم الاشتراك!' : 'Subscribed!'}
                  </motion.span>
                ) : (
                  <>
                    <span className="relative z-10">{language === 'ar' ? 'اشتراك' : 'Subscribe'}</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Send className="w-4 h-4 relative z-10" />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
          )}
        </div>

        {/* Bottom Bar with Animation */}
        <motion.div 
          className="py-8 border-t border-slate-200 dark:border-dark-800/50 flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.p
            className="text-slate-500 dark:text-dark-500 text-sm flex items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {footer.copyright[language]}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            </motion.span>
          </motion.p>

          {/* Scroll to Top with Epic Animation */}
          <motion.button
            onClick={scrollToTop}
            className="relative p-4 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 text-dark-900 transition-colors group shadow-lg shadow-gold-500/20"
            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(212, 175, 55, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowUp className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </footer>
  );
}
