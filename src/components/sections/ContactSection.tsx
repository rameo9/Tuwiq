'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Send, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  Loader2,
  MessageCircle
} from 'lucide-react';
import Card3D from '@/components/ui/Card3D';
import LocationMap from '@/components/LocationMap';
import type { SitePayload } from '@/lib/cms-read';
import { getSocialHref, getSocialIcon } from '@/lib/social';

export default function ContactSection({
  site,
  socialLinks,
}: {
  site: SitePayload;
  socialLinks: Array<{ platform: string; url: string }>;
}) {
  const { t, language, direction } = useLanguage();
  const { colors } = useTheme();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const contactRows = [
    { icon: MapPin, key: 'address', value: site.address },
    { icon: Phone, key: 'phone', value: { ar: site.phone, en: site.phone } },
    { icon: Mail, key: 'email', value: { ar: site.email, en: site.email } },
    { icon: Clock, key: 'hours', value: site.workingHours },
  ];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          phone: formState.phone,
          message: formState.message,
          subject:
            language === 'ar' ? 'رسالة من صفحة التواصل' : 'Contact form message',
        }),
      });
      if (!res.ok) {
        throw new Error('Request failed');
      }
      setIsSubmitted(true);
      setFormState({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch {
      window.alert(
        language === 'ar'
          ? 'تعذر إرسال الرسالة. حاول مرة أخرى.'
          : 'Could not send your message. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section ref={sectionRef} id="contact" className="relative py-32 overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950"
        style={{ y: backgroundY }}
      />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-20">
        <motion.div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

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
              <MessageCircle className="w-4 h-4" />
              {t('contact.subtitle')}
            </motion.span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('contact.title')}
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Contact Form with 3D Effect */}
          <motion.div
            initial={{ opacity: 0, x: direction === 'rtl' ? 100 : -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
            className="relative"
          >
            <Card3D intensity={5} className="rounded-3xl">
              <div className="relative glass rounded-3xl p-8 md:p-10 border border-slate-200/80 dark:border-white/10 overflow-hidden">
                {/* Animated Background Gradient */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    background: [
                      'radial-gradient(circle at 0% 0%, rgba(212,175,55,0.2) 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 100%, rgba(212,175,55,0.2) 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 100%, rgba(212,175,55,0.2) 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 0%, rgba(212,175,55,0.2) 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 0%, rgba(212,175,55,0.2) 0%, transparent 50%)',
                    ],
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />

                {isSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 relative z-10"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/30"
                    >
                      <CheckCircle className="w-12 h-12 text-white" />
                    </motion.div>
                    <motion.h3 
                      className="text-2xl font-bold text-slate-900 dark:text-white mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {language === 'ar' ? 'تم الإرسال بنجاح!' : 'Message Sent!'}
                    </motion.h3>
                    <motion.p 
                      className="text-slate-600 dark:text-dark-400 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {language === 'ar' 
                        ? 'شكراً لتواصلك معنا. سنرد عليك في أقرب وقت.'
                        : 'Thank you for contacting us. We will get back to you soon.'}
                    </motion.p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    {/* Name Input */}
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <input
                        type="text"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full px-6 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-transparent focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all peer dark:bg-dark-800/50 dark:border-dark-700 dark:text-white"
                        placeholder=" "
                      />
                      <label className={`absolute ${direction === 'rtl' ? 'right-6' : 'left-6'} top-4 text-slate-500 dark:text-dark-500 transition-all duration-300 pointer-events-none peer-focus:-top-2 peer-focus:text-sm peer-focus:text-gold-400 peer-focus:bg-slate-100 peer-focus:px-2 dark:peer-focus:bg-dark-900 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:bg-slate-100 peer-[:not(:placeholder-shown)]:px-2 dark:peer-[:not(:placeholder-shown)]:bg-dark-900`}>
                        {t('contact.name')}
                      </label>
                      <motion.div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        animate={{
                          boxShadow: focusedField === 'name' 
                            ? '0 0 20px rgba(212,175,55,0.2)'
                            : '0 0 0px rgba(212,175,55,0)',
                        }}
                      />
                    </motion.div>

                    {/* Email & Phone Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Email Input */}
                      <motion.div 
                        className="relative"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <input
                          type="email"
                          name="email"
                          value={formState.email}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className="w-full px-6 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-transparent focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all peer dark:bg-dark-800/50 dark:border-dark-700 dark:text-white"
                          placeholder=" "
                        />
                        <label className={`absolute ${direction === 'rtl' ? 'right-6' : 'left-6'} top-4 text-slate-500 dark:text-dark-500 transition-all duration-300 pointer-events-none peer-focus:-top-2 peer-focus:text-sm peer-focus:text-gold-400 peer-focus:bg-slate-100 peer-focus:px-2 dark:peer-focus:bg-dark-900 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:bg-slate-100 peer-[:not(:placeholder-shown)]:px-2 dark:peer-[:not(:placeholder-shown)]:bg-dark-900`}>
                          {t('contact.email')}
                        </label>
                        <motion.div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          animate={{
                            boxShadow: focusedField === 'email' 
                              ? '0 0 20px rgba(212,175,55,0.2)'
                              : '0 0 0px rgba(212,175,55,0)',
                          }}
                        />
                      </motion.div>

                      {/* Phone Input */}
                      <motion.div 
                        className="relative"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <input
                          type="tel"
                          name="phone"
                          value={formState.phone}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-6 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-transparent focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all peer dark:bg-dark-800/50 dark:border-dark-700 dark:text-white"
                          placeholder=" "
                        />
                        <label className={`absolute ${direction === 'rtl' ? 'right-6' : 'left-6'} top-4 text-slate-500 dark:text-dark-500 transition-all duration-300 pointer-events-none peer-focus:-top-2 peer-focus:text-sm peer-focus:text-gold-400 peer-focus:bg-slate-100 peer-focus:px-2 dark:peer-focus:bg-dark-900 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:bg-slate-100 peer-[:not(:placeholder-shown)]:px-2 dark:peer-[:not(:placeholder-shown)]:bg-dark-900`}>
                          {t('contact.phone')}
                        </label>
                        <motion.div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          animate={{
                            boxShadow: focusedField === 'phone' 
                              ? '0 0 20px rgba(212,175,55,0.2)'
                              : '0 0 0px rgba(212,175,55,0)',
                          }}
                        />
                      </motion.div>
                    </div>

                    {/* Message Input */}
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <textarea
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        required
                        rows={5}
                        className="w-full px-6 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-transparent focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all peer resize-none dark:bg-dark-800/50 dark:border-dark-700 dark:text-white"
                        placeholder=" "
                      />
                      <label className={`absolute ${direction === 'rtl' ? 'right-6' : 'left-6'} top-4 text-slate-500 dark:text-dark-500 transition-all duration-300 pointer-events-none peer-focus:-top-2 peer-focus:text-sm peer-focus:text-gold-400 peer-focus:bg-slate-100 peer-focus:px-2 dark:peer-focus:bg-dark-900 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:bg-slate-100 peer-[:not(:placeholder-shown)]:px-2 dark:peer-[:not(:placeholder-shown)]:bg-dark-900`}>
                        {t('contact.message')}
                      </label>
                      <motion.div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        animate={{
                          boxShadow: focusedField === 'message' 
                            ? '0 0 20px rgba(212,175,55,0.2)'
                            : '0 0 0px rgba(212,175,55,0)',
                        }}
                      />
                    </motion.div>

                    {/* Submit Button with Advanced Animation */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className={`relative w-full py-5 rounded-xl text-dark-900 font-bold text-lg flex items-center justify-center gap-3 group disabled:opacity-50 overflow-hidden ${
                        direction === 'rtl'
                          ? 'bg-gradient-to-l from-gold-500 to-gold-600'
                          : 'bg-gradient-to-r from-gold-500 to-gold-600'
                      }`}
                      whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(212, 175, 55, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Shine Effect */}
                      <motion.div
                        className={`absolute inset-0 from-transparent via-white/30 to-transparent ${
                          direction === 'rtl' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'
                        }`}
                        animate={{
                          x: direction === 'rtl' ? ['100%', '-100%'] : ['-100%', '100%'],
                        }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                      
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 className="w-5 h-5" />
                          </motion.div>
                          {language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <span className="relative z-10">{t('contact.send')}</span>
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Send className="w-5 h-5 relative z-10" />
                          </motion.div>
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </div>
            </Card3D>

            {/* Decorative Corners */}
            <motion.div
              className={`absolute -top-4 w-24 h-24 border-t-2 border-gold-500/30 ${
                direction === 'rtl'
                  ? '-right-4 border-r-2 rounded-tr-3xl'
                  : '-left-4 border-l-2 rounded-tl-3xl'
              }`}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            />
            <motion.div
              className={`absolute -bottom-4 w-24 h-24 border-b-2 border-gold-500/30 ${
                direction === 'rtl'
                  ? '-left-4 border-l-2 rounded-bl-3xl'
                  : '-right-4 border-r-2 rounded-br-3xl'
              }`}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            />
          </motion.div>

          {/* Contact Info with Advanced Animations */}
          <motion.div
            initial={{ opacity: 0, x: direction === 'rtl' ? -100 : 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Info Cards */}
            <div className="space-y-4">
              {contactRows.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: direction === 'rtl' ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                  onMouseEnter={() => setHoveredInfo(item.key)}
                  onMouseLeave={() => setHoveredInfo(null)}
                >
                  <Card3D intensity={8} className="rounded-2xl">
                    <motion.div 
                      className="flex items-center gap-5 p-6 glass rounded-2xl border border-slate-200/80 dark:border-white/5 transition-all duration-300"
                      animate={{
                        borderColor: hoveredInfo === item.key ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.05)',
                        backgroundColor: hoveredInfo === item.key ? 'rgba(212,175,55,0.05)' : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <motion.div 
                        className="p-4 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 shadow-lg shadow-gold-500/20"
                        animate={{
                          scale: hoveredInfo === item.key ? 1.1 : 1,
                          rotate: hoveredInfo === item.key ? [0, -5, 5, 0] : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <item.icon className="w-6 h-6 text-dark-900" />
                      </motion.div>
                      <div>
                        <p className="text-slate-600 dark:text-dark-400 text-sm mb-1">
                          {item.key === 'address' ? t('contact.address') : 
                           item.key === 'phone' ? t('contact.phone') :
                           item.key === 'email' ? t('contact.email') : 
                           language === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                        </p>
                        <motion.p 
                          className={`font-semibold ${
                            hoveredInfo === item.key
                              ? 'text-gold-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.value[language]}
                        </motion.p>
                      </div>
                    </motion.div>
                  </Card3D>
                </motion.div>
              ))}
            </div>

            {/* Social Links with Epic Animation */}
            <motion.div 
              className="glass rounded-2xl p-6 border border-slate-200/80 dark:border-white/5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-slate-900 dark:text-white font-bold mb-5 flex items-center gap-2">
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                >
                  ✨
                </motion.span>
                {t('contact.followUs')}
              </h3>
              <div className="flex gap-4">
                {socialLinks
                  .filter((s) => s.url.trim())
                  .map((s, index) => {
                    const Icon = getSocialIcon(s.platform);
                    const href = getSocialHref(s.platform, s.url);
                    return (
                  <motion.a
                    key={`${s.platform}-${index}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.1, type: 'spring', stiffness: 200 }}
                    whileHover={{ 
                      scale: 1.2, 
                      y: -8,
                      boxShadow: '0 10px 30px rgba(212,175,55,0.3)',
                    }}
                    className="p-4 rounded-xl bg-slate-200 hover:bg-gradient-to-br hover:from-gold-500 hover:to-gold-600 text-slate-600 hover:text-dark-900 transition-all duration-300 dark:bg-dark-800 dark:text-dark-400"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                    );
                  })}
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <LocationMap
                mapUrl={site.mapUrl}
                query={site.address[language]}
                openLabel={
                  language === 'ar' ? 'فتح في Google Maps' : 'Open in Google Maps'
                }
                loadingLabel={
                  language === 'ar' ? 'جاري تحميل الخريطة' : 'Loading map'
                }
                className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200/80 dark:border-white/10"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
