# صقر الجزيرة للتطوير العقاري | Saqr Al Jazera Real Estate

موقع عقاري احترافي مع لوحة تحكم كاملة

## المميزات

### الواجهة الأمامية (Landing Page)
- ✅ تصميم عصري وأنيق مع تأثيرات Motion إبداعية
- ✅ دعم اللغتين العربية والإنجليزية
- ✅ الوضع الداكن والفاتح
- ✅ أقسام: الرئيسية، من نحن، أعمالنا، المعرض، خدماتنا، تواصل معنا
- ✅ تأثيرات بصرية متقدمة (Parallax, Particle Background, Cursor Glow)
- ✅ معرض صور تفاعلي مع Lightbox
- ✅ صفحة تفاصيل المشروع مع عرض PDF
- ✅ تصميم متجاوب لجميع الأجهزة

### لوحة التحكم (Admin Panel)
- ✅ Dashboard مع إحصائيات
- ✅ إدارة المشاريع (إضافة/تعديل/حذف)
- ✅ إدارة معرض الصور
- ✅ إدارة الخدمات
- ✅ إدارة الرسائل
- ✅ تعديل الصفحة الرئيسية
- ✅ إدارة الروابط الاجتماعية
- ✅ إعدادات الثيم والألوان
- ✅ إعدادات الموقع العامة

## التقنيات المستخدمة

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React

## التثبيت

```bash
# تثبيت المتطلبات
npm install

# تشغيل بيئة التطوير
npm run dev

# بناء المشروع
npm run build

# تشغيل الإنتاج
npm start
```

## الهيكل

```
src/
├── app/
│   ├── page.tsx              # الصفحة الرئيسية
│   ├── layout.tsx            # Layout الرئيسي
│   ├── globals.css           # الأنماط العامة
│   ├── projects/[id]/        # صفحة تفاصيل المشروع
│   └── admin/                # لوحة التحكم
│       ├── page.tsx          # Dashboard
│       ├── layout.tsx        # Admin Layout
│       ├── login/            # تسجيل الدخول
│       ├── projects/         # إدارة المشاريع
│       ├── gallery/          # إدارة المعرض
│       ├── services/         # إدارة الخدمات
│       ├── messages/         # إدارة الرسائل
│       ├── landing/          # تعديل الصفحة الرئيسية
│       ├── social/           # الروابط الاجتماعية
│       ├── theme/            # الثيم والألوان
│       └── settings/         # الإعدادات
├── components/
│   ├── ui/                   # المكونات العامة
│   │   ├── Navbar.tsx
│   │   ├── CursorGlow.tsx
│   │   ├── ParticleBackground.tsx
│   │   ├── MagneticButton.tsx
│   │   └── AnimatedText.tsx
│   └── sections/             # أقسام الصفحة
│       ├── HeroSection.tsx
│       ├── AboutSection.tsx
│       ├── ProjectsSection.tsx
│       ├── GallerySection.tsx
│       ├── ServicesSection.tsx
│       ├── ContactSection.tsx
│       └── Footer.tsx
├── contexts/
│   ├── LanguageContext.tsx   # إدارة اللغة
│   └── ThemeContext.tsx      # إدارة الثيم
└── hooks/
    └── useScrollReveal.ts    # Hooks للتأثيرات
```

## الوصول للوحة التحكم

- الرابط (بعد تشغيل المشروع محلياً أو على السيرفر): `/admin`
- أنشئ ملف `.env` من القالب ثم ضبّط `ADMIN_PASSWORD` (**8 أحرف على الأقل**) واختياريًا `ADMIN_USERNAME` (افتراضيًا `admin`).

```bash
cp .env.example .env
npm run db:push
npm run db:seed
```

لا توجد كلمة مرور افتراضية في الكود؛ بيانات الدخول تأتي من `ADMIN_PASSWORD` عند تشغيل الـ seed فقط، ولا ترفع ملف `.env` إلى Git.

## الملاحظات

- الواجهة مربوطة بـ Prisma وواجهات API؛ بعض النصوص التوضيحية أو الصور تجريبية قد تأتي من Unsplash أو من السيد الأولي.


## الرخصة

MIT License

<!-- test-commit -->
