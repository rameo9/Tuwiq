'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.projects': 'أعمالنا',
    'nav.gallery': 'المعرض',
    'nav.services': 'خدماتنا',
    'nav.contact': 'تواصل معنا',
    
    // Hero Section
    'hero.subtitle': 'نبني المستقبل',
    'hero.title': 'صقر الجزيرة للتطوير العقاري',
    'hero.description': 'نقدم لكم أفضل المشاريع العقارية الفاخرة في المملكة العربية السعودية، بتصاميم عصرية ومواقع استراتيجية',
    'hero.cta': 'استكشف مشاريعنا',
    'hero.stats.projects': 'مشروع منجز',
    'hero.stats.clients': 'عميل راضٍ',
    'hero.stats.years': 'سنوات خبرة',
    
    // About Section
    'about.subtitle': 'تعرف علينا',
    'about.title': 'من نحن',
    'about.description': 'صقر الجزيرة هي شركة رائدة في مجال التطوير العقاري، نسعى دائماً لتقديم أفضل الحلول العقارية التي تلبي تطلعات عملائنا',
    'about.vision': 'رؤيتنا',
    'about.vision.text': 'أن نكون الخيار الأول في التطوير العقاري في المنطقة',
    'about.mission': 'مهمتنا',
    'about.mission.text': 'تقديم مشاريع عقارية متميزة بأعلى معايير الجودة',
    'about.values': 'قيمنا',
    'about.values.text': 'الجودة والابتكار والشفافية والالتزام',
    
    // Projects Section
    'projects.subtitle': 'مشاريعنا المتميزة',
    'projects.title': 'أعمالنا',
    'projects.viewAll': 'عرض الكل',
    'projects.viewDetails': 'عرض التفاصيل',
    'projects.location': 'الموقع',
    'projects.area': 'المساحة',
    'projects.units': 'الوحدات',
    'projects.downloadPdf': 'تحميل الكتيب',
    
    // Gallery Section
    'gallery.subtitle': 'لحظات مميزة',
    'gallery.title': 'المعرض',
    
    // Services Section
    'services.subtitle': 'ماذا نقدم',
    'services.title': 'خدماتنا',
    'services.development': 'التطوير العقاري',
    'services.development.desc': 'تطوير مشاريع سكنية وتجارية متكاملة',
    'services.consulting': 'الاستشارات العقارية',
    'services.consulting.desc': 'نقدم استشارات متخصصة في السوق العقاري',
    'services.management': 'إدارة الممتلكات',
    'services.management.desc': 'إدارة احترافية للممتلكات العقارية',
    'services.investment': 'الاستثمار العقاري',
    'services.investment.desc': 'فرص استثمارية مميزة في القطاع العقاري',
    
    // Contact Section
    'contact.subtitle': 'نحن هنا لمساعدتك',
    'contact.title': 'تواصل معنا',
    'contact.name': 'الاسم الكامل',
    'contact.email': 'البريد الإلكتروني',
    'contact.phone': 'رقم الجوال',
    'contact.message': 'رسالتك',
    'contact.send': 'إرسال الرسالة',
    'contact.address': 'العنوان',
    'contact.followUs': 'تابعنا على',
    
    // Footer
    'footer.rights': 'جميع الحقوق محفوظة',
    'footer.company': 'صقر الجزيرة للتطوير العقاري',
    
    // Common
    'common.learnMore': 'اعرف المزيد',
    'common.sqm': 'م²',
    'common.loading': 'جاري التحميل...',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.projects': 'Projects',
    'nav.gallery': 'Gallery',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.subtitle': 'Building the Future',
    'hero.title': 'Saqr Al Jazera Real Estate Development',
    'hero.description': 'We offer you the finest luxury real estate projects in Saudi Arabia, with modern designs and strategic locations',
    'hero.cta': 'Explore Our Projects',
    'hero.stats.projects': 'Projects Completed',
    'hero.stats.clients': 'Happy Clients',
    'hero.stats.years': 'Years Experience',
    
    // About Section
    'about.subtitle': 'Get to Know Us',
    'about.title': 'About Us',
    'about.description': 'Saqr Al Jazera is a leading real estate development company, always striving to provide the best real estate solutions that meet our clients\' aspirations',
    'about.vision': 'Our Vision',
    'about.vision.text': 'To be the first choice in real estate development in the region',
    'about.mission': 'Our Mission',
    'about.mission.text': 'Delivering outstanding real estate projects with the highest quality standards',
    'about.values': 'Our Values',
    'about.values.text': 'Quality, Innovation, Transparency, and Commitment',
    
    // Projects Section
    'projects.subtitle': 'Our Distinguished Projects',
    'projects.title': 'Our Work',
    'projects.viewAll': 'View All',
    'projects.viewDetails': 'View Details',
    'projects.location': 'Location',
    'projects.area': 'Area',
    'projects.units': 'Units',
    'projects.downloadPdf': 'Download Brochure',
    
    // Gallery Section
    'gallery.subtitle': 'Special Moments',
    'gallery.title': 'Gallery',
    
    // Services Section
    'services.subtitle': 'What We Offer',
    'services.title': 'Our Services',
    'services.development': 'Real Estate Development',
    'services.development.desc': 'Developing integrated residential and commercial projects',
    'services.consulting': 'Real Estate Consulting',
    'services.consulting.desc': 'Specialized consulting in the real estate market',
    'services.management': 'Property Management',
    'services.management.desc': 'Professional management of real estate properties',
    'services.investment': 'Real Estate Investment',
    'services.investment.desc': 'Distinguished investment opportunities in the real estate sector',
    
    // Contact Section
    'contact.subtitle': 'We Are Here to Help',
    'contact.title': 'Contact Us',
    'contact.name': 'Full Name',
    'contact.email': 'Email Address',
    'contact.phone': 'Phone Number',
    'contact.message': 'Your Message',
    'contact.send': 'Send Message',
    'contact.address': 'Address',
    'contact.followUs': 'Follow Us',
    
    // Footer
    'footer.rights': 'All Rights Reserved',
    'footer.company': 'Saqr Al Jazera Real Estate Development',
    
    // Common
    'common.learnMore': 'Learn More',
    'common.sqm': 'sqm',
    'common.loading': 'Loading...',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [direction, setDirection] = useState<Direction>('rtl');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
      setDirection(savedLanguage === 'ar' ? 'rtl' : 'ltr');
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    localStorage.setItem('language', language);
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setDirection(lang === 'ar' ? 'rtl' : 'ltr');
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
