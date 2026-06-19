import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const landingJson = {
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
      ar: 'نبني المستقبل بأيدٍ أمينة، ونحقق أحلامكم العقارية بأعلى معايير الجودة والاحترافية.',
      en: 'We build the future with integrity and deliver your property aspirations with excellence.',
    },
    showNewsletter: true,
  },
};

const siteSettingsJson = {
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
  metaKeywords: 'عقارات, تطوير عقاري, فلل, شقق',
};

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim() || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error(
      'ADMIN_PASSWORD must be set in .env before seed (min 8 characters). Never commit real passwords.',
    );
  }

  await prisma.newsletterSubscriber.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.projectFeature.deleteMany();
  await prisma.projectImage.deleteMany();
  await prisma.project.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.serviceItem.deleteMany();
  await prisma.adminUser.deleteMany({});

  const hash = await bcrypt.hash(adminPassword, 12);
  await prisma.adminUser.create({
    data: { username, passwordHash: hash },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'landing' },
    update: { value: JSON.stringify(landingJson) },
    create: { key: 'landing', value: JSON.stringify(landingJson) },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'site' },
    update: { value: JSON.stringify(siteSettingsJson) },
    create: { key: 'site', value: JSON.stringify(siteSettingsJson) },
  });

  const gallerySeed = [
    {
      src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      titleAr: 'فيلا فاخرة',
      titleEn: 'Luxury Villa',
      category: 'villas',
      size: 'large',
      sortOrder: 0,
    },
    {
      src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      titleAr: 'تصميم عصري',
      titleEn: 'Modern Design',
      category: 'interior',
      size: 'small',
      sortOrder: 1,
    },
    {
      src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      titleAr: 'غرفة معيشة',
      titleEn: 'Living Room',
      category: 'interior',
      size: 'small',
      sortOrder: 2,
    },
    {
      src: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
      titleAr: 'مطبخ حديث',
      titleEn: 'Modern Kitchen',
      category: 'interior',
      size: 'medium',
      sortOrder: 3,
    },
    {
      src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      titleAr: 'واجهة خارجية',
      titleEn: 'Exterior View',
      category: 'exterior',
      size: 'medium',
      sortOrder: 4,
    },
    {
      src: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80',
      titleAr: 'حمام سباحة',
      titleEn: 'Swimming Pool',
      category: 'amenities',
      size: 'large',
      sortOrder: 5,
    },
    {
      src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
      titleAr: 'غرفة نوم',
      titleEn: 'Bedroom',
      category: 'interior',
      size: 'small',
      sortOrder: 6,
    },
    {
      src: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
      titleAr: 'حديقة',
      titleEn: 'Garden',
      category: 'exterior',
      size: 'small',
      sortOrder: 7,
    },
  ];

  await prisma.galleryItem.createMany({ data: gallerySeed });

  await prisma.socialLink.createMany({
    data: [
      { platform: 'facebook', url: 'https://facebook.com/saqraljazera', enabled: true, sortOrder: 0 },
      { platform: 'twitter', url: 'https://twitter.com/saqraljazera', enabled: true, sortOrder: 1 },
      { platform: 'instagram', url: 'https://instagram.com/saqraljazera', enabled: true, sortOrder: 2 },
      { platform: 'linkedin', url: 'https://linkedin.com/company/saqraljazera', enabled: true, sortOrder: 3 },
      { platform: 'youtube', url: '', enabled: false, sortOrder: 4 },
      { platform: 'snapchat', url: '', enabled: false, sortOrder: 5 },
      { platform: 'tiktok', url: '', enabled: false, sortOrder: 6 },
      { platform: 'whatsapp', url: '966551234567', enabled: true, sortOrder: 7 },
    ],
  });

  await prisma.serviceItem.createMany({
    data: [
      {
        slug: 'development',
        iconId: 'building',
        titleAr: 'التطوير العقاري',
        titleEn: 'Real Estate Development',
        descriptionAr: 'تطوير مشاريع سكنية وتجارية متكاملة',
        descriptionEn: 'Developing integrated residential and commercial projects',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        enabled: true,
        sortOrder: 0,
      },
      {
        slug: 'consulting',
        iconId: 'message',
        titleAr: 'الاستشارات العقارية',
        titleEn: 'Real Estate Consulting',
        descriptionAr: 'نقدم استشارات متخصصة في السوق العقاري',
        descriptionEn: 'Specialized consulting in the real estate market',
        imageUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80',
        enabled: true,
        sortOrder: 1,
      },
      {
        slug: 'management',
        iconId: 'settings',
        titleAr: 'إدارة الممتلكات',
        titleEn: 'Property Management',
        descriptionAr: 'إدارة احترافية للممتلكات العقارية',
        descriptionEn: 'Professional management of real estate properties',
        imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        enabled: true,
        sortOrder: 2,
      },
      {
        slug: 'investment',
        iconId: 'trending',
        titleAr: 'الاستثمار العقاري',
        titleEn: 'Real Estate Investment',
        descriptionAr: 'فرص استثمارية مميزة في القطاع العقاري',
        descriptionEn: 'Distinguished investment opportunities',
        imageUrl: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&q=80',
        enabled: true,
        sortOrder: 3,
      },
    ],
  });

  const p1descAr =
    'يمثل برج السماء الذهبي قمة الفخامة والتصميم العصري في قلب الرياض. يتميز المشروع بموقعه الاستراتيجي في حي الملقا الراقي، ويوفر إطلالات خلابة على أفق المدينة.';
  const p1descEn =
    'Golden Sky Tower represents the pinnacle of luxury and modern design in the heart of Riyadh, with a strategic location in Al Malqa and stunning skyline views.';

  await prisma.project.create({
    data: {
      titleAr: 'برج السماء الذهبي',
      titleEn: 'Golden Sky Tower',
      locationAr: 'الرياض، حي الملقا',
      locationEn: 'Riyadh, Al Malqa',
      descriptionAr: p1descAr,
      descriptionEn: p1descEn,
      area: '50,000',
      units: '200',
      status: 'construction',
      categoryAr: 'سكني',
      categoryEn: 'Residential',
      mainImageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
      pdfUrl: null,
      completionYear: '2025',
      viewCount: 1234,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
            sortOrder: 1,
          },
          {
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
            sortOrder: 2,
          },
        ],
      },
      features: {
        create: [
          { textAr: 'مسبح خاص على السطح', textEn: 'Private rooftop pool', sortOrder: 0 },
          { textAr: 'صالة رياضية متكاملة', textEn: 'Fully equipped gym', sortOrder: 1 },
          { textAr: 'نظام أمان متطور', textEn: 'Advanced security system', sortOrder: 2 },
          { textAr: 'مواقف سيارات ذكية', textEn: 'Smart parking', sortOrder: 3 },
        ],
      },
    },
  });

  const others = [
    {
      titleAr: 'مجمع الواحة التجاري',
      titleEn: 'Al Waha Commercial Complex',
      locationAr: 'جدة، حي الروضة',
      locationEn: 'Jeddah, Al Rawda',
      descriptionAr: 'مجمع تجاري متكامل في موقع استراتيجي.',
      descriptionEn: 'Integrated commercial complex in a strategic location.',
      area: '75,000',
      units: '150',
      status: 'active',
      categoryAr: 'تجاري',
      categoryEn: 'Commercial',
      mainImageUrl: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800&q=80',
      viewCount: 856,
    },
    {
      titleAr: 'فلل النخيل الفاخرة',
      titleEn: 'Al Nakheel Luxury Villas',
      locationAr: 'الدمام، حي الشاطئ',
      locationEn: 'Dammam, Al Shati',
      descriptionAr: 'مجمع فلل فاخرة على الواجهة البحرية.',
      descriptionEn: 'Luxury villas compound by the waterfront.',
      area: '120,000',
      units: '50',
      status: 'construction',
      categoryAr: 'فلل',
      categoryEn: 'Villas',
      mainImageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
      viewCount: 654,
    },
    {
      titleAr: 'مركز الأعمال الدولي',
      titleEn: 'International Business Center',
      locationAr: 'الرياض، طريق الملك فهد',
      locationEn: 'Riyadh, King Fahd Road',
      descriptionAr: 'برج مكاتب إداري بتقنيات ذكية.',
      descriptionEn: 'Smart office tower for enterprises.',
      area: '90,000',
      units: '300',
      status: 'active',
      categoryAr: 'مكاتب',
      categoryEn: 'Offices',
      mainImageUrl: 'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?w=800&q=80',
      viewCount: 421,
    },
    {
      titleAr: 'حدائق الزمرد السكنية',
      titleEn: 'Emerald Gardens Residential',
      locationAr: 'مكة المكرمة، العوالي',
      locationEn: 'Makkah, Al Awali',
      descriptionAr: 'مجمع سكني عائلي بمساحات خضراء واسعة.',
      descriptionEn: 'Family residential community with lush greenery.',
      area: '65,000',
      units: '180',
      status: 'active',
      categoryAr: 'سكني',
      categoryEn: 'Residential',
      mainImageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
      viewCount: 512,
    },
    {
      titleAr: 'مجمع البحر الأزرق',
      titleEn: 'Blue Sea Complex',
      locationAr: 'الخبر، الكورنيش',
      locationEn: 'Al Khobar, Corniche',
      descriptionAr: 'إطلالة بحرية وخدمات متكاملة للعائلات.',
      descriptionEn: 'Sea views and full amenities for families.',
      area: '45,000',
      units: '120',
      status: 'completed',
      categoryAr: 'سكني',
      categoryEn: 'Residential',
      mainImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      viewCount: 389,
    },
  ];

  for (const o of others) {
    await prisma.project.create({
      data: {
        ...o,
        pdfUrl: null,
        images: {
          create: [{ url: o.mainImageUrl, sortOrder: 0 }],
        },
      },
    });
  }

  await prisma.contactMessage.createMany({
    data: [
      {
        name: 'أحمد محمد الغامدي',
        email: 'ahmed@example.com',
        phone: '+966 55 123 4567',
        subject: 'استفسار عن مشروع برج السماء',
        message: 'أود الاستفسار عن الأسعار والمساحات المتاحة.',
        isRead: false,
        isStarred: true,
      },
      {
        name: 'سارة علي العتيبي',
        email: 'sara@example.com',
        phone: '+966 55 987 6543',
        subject: 'طلب موعد لزيارة المشروع',
        message: 'أرغب في حجز موعد لزيارة أحد المشاريع.',
        isRead: true,
        isStarred: false,
      },
    ],
  });

  console.log(`Seed OK — admin user "${username}" (password taken from ADMIN_PASSWORD in .env; not logged)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
