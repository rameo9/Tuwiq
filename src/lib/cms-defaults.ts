export const defaultLanding = {
  hero: {
    subtitle: { ar: 'نبني المستقبل', en: 'Building the Future' },
    title: {
      ar: 'صقر الجزيرة للتطوير العقاري',
      en: 'Saqr Al Jazera Real Estate Development',
    },
    description: {
      ar: 'نقدم لكم أفضل المشاريع العقارية الفاخرة في المملكة العربية السعودية',
      en: 'We offer you the finest luxury real estate projects in Saudi Arabia',
    },
    ctaText: { ar: 'استكشف مشاريعنا', en: 'Explore Our Projects' },
    videoUrl: '',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
    ],
    stats: [
      { value: '150+', label: { ar: 'مشروع منجز', en: 'Projects Completed' } },
      { value: '500+', label: { ar: 'عميل راضٍ', en: 'Happy Clients' } },
      { value: '15+', label: { ar: 'سنوات خبرة', en: 'Years Experience' } },
    ],
    showStats: true,
  },
  about: {
    subtitle: { ar: 'تعرف علينا', en: 'Get to Know Us' },
    title: { ar: 'من نحن', en: 'About Us' },
    description: {
      ar: 'صقر الجزيرة هي شركة رائدة في مجال التطوير العقاري',
      en: 'Saqr Al Jazera is a leading real estate development company',
    },
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    features: [
      {
        title: { ar: 'رؤيتنا', en: 'Our Vision' },
        text: {
          ar: 'أن نكون الخيار الأول في التطوير العقاري',
          en: 'To be the first choice in real estate development',
        },
      },
      {
        title: { ar: 'مهمتنا', en: 'Our Mission' },
        text: {
          ar: 'تقديم مشاريع عقارية متميزة',
          en: 'Delivering outstanding real estate projects',
        },
      },
      {
        title: { ar: 'قيمنا', en: 'Our Values' },
        text: {
          ar: 'الجودة والابتكار والشفافية',
          en: 'Quality, Innovation, Transparency',
        },
      },
    ],
  },
  footer: {
    copyright: {
      ar: '© طويق',
      en: '© Tuwaiq',
    },
    companyBlurb: {
      ar: 'نبني المستقبل بأيدٍ أمينة.',
      en: 'We build the future with integrity.',
    },
    showNewsletter: true,
  },
};

export const defaultSite = {
  siteName: { ar: 'صقر الجزيرة للتطوير العقاري', en: 'Saqr Al Jazera Real Estate' },
  siteDescription: {
    ar: 'نقدم لكم أفضل المشاريع العقارية الفاخرة',
    en: 'We offer you the finest luxury real estate projects',
  },
  logo: '/logo-tuwaiq.png',
  favicon: '',
  email: 'info@saqraljazera.com',
  phone: '+966 55 123 4567',
  whatsappNumber: '966551234567',
  address: { ar: 'الرياض، المملكة العربية السعودية', en: 'Riyadh, Saudi Arabia' },
  workingHours: { ar: 'السبت - الخميس: 9 ص - 6 م', en: 'Sat - Thu: 9 AM - 6 PM' },
  mapUrl: '',
  defaultLanguage: 'ar',
  defaultTheme: 'dark',
  maintenanceMode: false,
  analyticsId: '',
  metaKeywords: '',
};

export type LandingPayload = typeof defaultLanding;
export type SitePayload = typeof defaultSite;
