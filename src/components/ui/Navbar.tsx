'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import SiteLogo from '@/components/ui/SiteLogo';

const navItems = [
  { key: 'nav.home', href: '#home' },
  { key: 'nav.about', href: '#about' },
  { key: 'nav.projects', href: '#projects' },
  { key: 'nav.gallery', href: '#gallery' },
  { key: 'nav.services', href: '#services' },
  { key: 'nav.contact', href: '#contact' },
];

export default function Navbar({
  siteName,
  logo,
}: {
  siteName?: { ar: string; en: string };
  logo?: string;
}) {
  const { language, setLanguage, t, direction } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const sections = navItems.map(item => item.href.replace('#', ''));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3 glass-dark shadow-lg shadow-black/10'
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10"
          >
            <SiteLogo logo={logo} siteName={siteName} language={language} />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.button
                key={item.key}
                onClick={() => handleNavClick(item.href)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  activeSection === item.href.replace('#', '')
                    ? 'text-gold-500 dark:text-gold-400'
                    : 'text-slate-700 hover:text-slate-900 dark:text-dark-300 dark:hover:text-white'
                }`}
              >
                {t(item.key)}
                {activeSection === item.href.replace('#', '') && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white/80 hover:bg-slate-100 transition-colors border border-slate-300/80 dark:bg-dark-800/50 dark:hover:bg-dark-700/50 dark:border-dark-700/50"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5 text-gold-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5 text-gold-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/80 hover:bg-slate-100 transition-colors border border-slate-300/80 dark:bg-dark-800/50 dark:hover:bg-dark-700/50 dark:border-dark-700/50"
            >
              <Globe className="w-5 h-5 text-gold-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-dark-200">
                {language === 'ar' ? 'EN' : 'ع'}
              </span>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white/80 hover:bg-slate-100 transition-colors border border-slate-300/80 dark:bg-dark-800/50 dark:hover:bg-dark-700/50 dark:border-dark-700/50"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X className="w-5 h-5 text-gold-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu className="w-5 h-5 text-gold-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: direction === 'rtl' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: direction === 'rtl' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`absolute top-0 ${direction === 'rtl' ? 'right-0' : 'left-0'} w-80 h-full bg-slate-50 border-slate-200 dark:bg-dark-900 ${direction === 'rtl' ? 'border-l' : 'border-r'} dark:border-dark-700`}
            >
              <div className="p-6 pt-24">
                <div className="space-y-2">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.key}
                      onClick={() => handleNavClick(item.href)}
                      initial={{ opacity: 0, x: direction === 'rtl' ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-full text-${direction === 'rtl' ? 'right' : 'left'} px-4 py-3 rounded-xl text-lg font-medium transition-all duration-300 ${
                        activeSection === item.href.replace('#', '')
                          ? 'bg-gold-500/10 text-gold-600 border border-gold-500/30 dark:text-gold-400 dark:border-gold-500/20'
                          : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:text-dark-300 dark:hover:bg-dark-800 dark:hover:text-white'
                      }`}
                    >
                      {t(item.key)}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
