'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Image,
  Settings,
  Mail,
  Users,
  FileText,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Home,
  Globe,
  Palette,
  Link2
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: { ar: 'لوحة التحكم', en: 'Dashboard' }, href: '/admin' },
  { icon: Home, label: { ar: 'الصفحة الرئيسية', en: 'Landing Page' }, href: '/admin/landing' },
  { icon: Building2, label: { ar: 'المشاريع', en: 'Projects' }, href: '/admin/projects' },
  { icon: Image, label: { ar: 'المعرض', en: 'Gallery' }, href: '/admin/gallery' },
  { icon: FileText, label: { ar: 'الخدمات', en: 'Services' }, href: '/admin/services' },
  { icon: Mail, label: { ar: 'الرسائل', en: 'Messages' }, href: '/admin/messages' },
  { icon: Link2, label: { ar: 'الروابط الاجتماعية', en: 'Social Links' }, href: '/admin/social' },
  { icon: Palette, label: { ar: 'الثيم والألوان', en: 'Theme & Colors' }, href: '/admin/theme' },
  { icon: Settings, label: { ar: 'الإعدادات', en: 'Settings' }, href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const pathname = usePathname();
  const router = useRouter();

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark-950' : 'bg-gray-100'}`} dir={direction}>
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className={`fixed top-0 ${direction === 'rtl' ? 'right-0' : 'left-0'} h-full z-40 hidden lg:block ${
          theme === 'dark' ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'
        } border-${direction === 'rtl' ? 'l' : 'r'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
              <span className="text-dark-900 font-bold text-lg">ص</span>
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <h1 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
                  </h1>
                  <p className={`text-xs ${theme === 'dark' ? 'text-dark-400' : 'text-gray-500'}`}>
                    {language === 'ar' ? 'صقر الجزيرة' : 'Saqr Al Jazera'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900'
                        : theme === 'dark'
                          ? 'text-dark-400 hover:bg-dark-800 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    whileHover={{ x: direction === 'rtl' ? -5 : 5 }}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                      {isSidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.label[language]}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`absolute top-1/2 ${direction === 'rtl' ? '-left-3' : '-right-3'} p-1.5 rounded-full ${
              theme === 'dark' ? 'bg-dark-800 text-dark-300' : 'bg-white text-gray-600 shadow-md'
            }`}
          >
            {isSidebarOpen ? (
              direction === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            ) : (
              direction === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-dark-800">
            <Link href="/">
              <motion.div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  theme === 'dark'
                    ? 'text-dark-400 hover:bg-dark-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                whileHover={{ x: direction === 'rtl' ? -5 : 5 }}
              >
                <Globe className="w-5 h-5" />
                {isSidebarOpen && (
                  <span className="font-medium">
                    {language === 'ar' ? 'عرض الموقع' : 'View Site'}
                  </span>
                )}
              </motion.div>
            </Link>
            <motion.button
              type="button"
              onClick={() => void handleLogout()}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 ${
                theme === 'dark' ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
              }`}
              whileHover={{ x: direction === 'rtl' ? -5 : 5 }}
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && (
                <span className="font-medium">
                  {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 z-40 ${
        theme === 'dark' ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'
      } border-b`}>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <span className="text-dark-900 font-bold text-sm">ص</span>
            </div>
            <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {language === 'ar' ? 'لوحة التحكم' : 'Admin'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2">
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gold-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: direction === 'rtl' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: direction === 'rtl' ? '100%' : '-100%' }}
              className={`fixed top-0 ${direction === 'rtl' ? 'right-0' : 'left-0'} w-80 h-full z-50 ${
                theme === 'dark' ? 'bg-dark-900' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                    <span className="text-dark-900 font-bold text-lg">ص</span>
                  </div>
                  <div>
                    <h1 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
                    </h1>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                        isActive
                          ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900'
                          : theme === 'dark'
                            ? 'text-dark-400 hover:bg-dark-800'
                            : 'text-gray-600 hover:bg-gray-100'
                      }`}>
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label[language]}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
        className="transition-all duration-300"
        style={{ 
          marginRight: direction === 'rtl' ? (isSidebarOpen ? '280px' : '80px') : '0',
          marginLeft: direction === 'ltr' ? (isSidebarOpen ? '280px' : '80px') : '0'
        }}
      >
        {/* Top Bar */}
        <header className={`hidden lg:flex items-center justify-between px-8 py-4 ${
          theme === 'dark' ? 'bg-dark-900/50 border-dark-800' : 'bg-white/50 border-gray-200'
        } border-b backdrop-blur-xl sticky top-0 z-30`}>
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {menuItems.find(item => item.href === pathname)?.label[language] || (language === 'ar' ? 'لوحة التحكم' : 'Dashboard')}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                theme === 'dark' ? 'bg-dark-800 text-dark-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{language === 'ar' ? 'EN' : 'ع'}</span>
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl ${
                theme === 'dark' ? 'bg-dark-800 text-gold-400' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
              theme === 'dark' ? 'bg-dark-800' : 'bg-gray-100'
            }`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-dark-900" />
              </div>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
