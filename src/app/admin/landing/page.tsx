'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Save,
  Upload,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Image as ImageIcon,
  Type,
  AlignLeft,
  Loader2,
} from 'lucide-react';

import { uploadAdminFile } from '@/lib/client-upload';
import { defaultLanding } from '@/lib/cms-defaults';

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export default function AdminLanding() {
  const [activeSection, setActiveSection] = useState('hero');
  const [landingLoading, setLandingLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroData, setHeroData] = useState(() => clone(defaultLanding.hero));
  const [heroTextLang, setHeroTextLang] = useState<'ar' | 'en'>('ar');
  const [heroImageBusy, setHeroImageBusy] = useState(false);
  const [heroVideoBusy, setHeroVideoBusy] = useState(false);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const heroVideoInputRef = useRef<HTMLInputElement>(null);
  const aboutImageInputRef = useRef<HTMLInputElement>(null);
  const [aboutImageBusy, setAboutImageBusy] = useState(false);
  const [aboutData, setAboutData] = useState(() => clone(defaultLanding.about));
  const [footerData, setFooterData] = useState(() => clone(defaultLanding.footer));

  const addHeroSlideImage = async (file: File) => {
    setHeroImageBusy(true);
    try {
      const url = await uploadAdminFile(file);
      setHeroData((prev) => ({ ...prev, images: [...prev.images, url] }));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'فشل رفع الصورة.');
    } finally {
      setHeroImageBusy(false);
    }
  };

  const uploadHeroVideo = async (file: File) => {
    setHeroVideoBusy(true);
    try {
      const url = await uploadAdminFile(file);
      setHeroData((prev) => ({ ...prev, videoUrl: url }));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'فشل رفع الفيديو.');
    } finally {
      setHeroVideoBusy(false);
    }
  };

  const uploadAboutImage = async (file: File) => {
    setAboutImageBusy(true);
    try {
      const url = await uploadAdminFile(file);
      setAboutData((prev) => ({ ...prev, image: url }));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'فشل رفع الصورة.');
    } finally {
      setAboutImageBusy(false);
    }
  };

  const sections = [
    { id: 'hero', label: 'القسم الرئيسي (Hero)', icon: ImageIcon },
    { id: 'about', label: 'من نحن', icon: AlignLeft },
    { id: 'services', label: 'خدماتنا', icon: Type },
    { id: 'footer', label: 'الفوتر', icon: AlignLeft },
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLandingLoading(true);
      try {
        const res = await fetch('/api/cms/landing', { credentials: 'include' });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled || !data) return;
        if (data.hero) setHeroData(clone(data.hero));
        if (data.about) setAboutData(clone(data.about));
        if (data.footer) setFooterData(clone(data.footer));
      } catch {
        /* defaults */
      } finally {
        if (!cancelled) setLandingLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/cms/landing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          hero: heroData,
          about: aboutData,
          footer: footerData,
        }),
      });
      if (!res.ok) throw new Error();
      window.alert('تم حفظ التغييرات!');
    } catch {
      window.alert('فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (landingLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">تعديل الصفحة الرئيسية</h1>
          <p className="text-dark-400 mt-1">تخصيص محتوى وتصميم صفحة الهبوط</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => window.open('/', '_blank')}
            className="flex items-center gap-2 px-5 py-3 bg-dark-800 text-white rounded-xl border border-dark-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="w-5 h-5" />
            <span>معاينة</span>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold rounded-xl disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>حفظ التغييرات</span>
          </motion.button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sections Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-4 space-y-2 sticky top-24">
            <h3 className="text-white font-bold px-4 py-2">أقسام الصفحة</h3>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900'
                    : 'text-dark-400 hover:bg-dark-800 hover:text-white'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Editor */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'hero' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Hero Text Content */}
              <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-6">
                <h2 className="text-lg font-bold text-white">محتوى القسم الرئيسي</h2>

                {/* Language Tabs */}
                <div className="flex gap-2 p-1 bg-dark-800 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setHeroTextLang('ar')}
                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                      heroTextLang === 'ar'
                        ? 'bg-gold-500 text-dark-900'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroTextLang('en')}
                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                      heroTextLang === 'en'
                        ? 'bg-gold-500 text-dark-900'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      {heroTextLang === 'ar' ? 'العنوان الفرعي' : 'Subtitle'}
                    </label>
                    <input
                      type="text"
                      value={heroData.subtitle[heroTextLang]}
                      onChange={(e) =>
                        setHeroData((prev) => ({
                          ...prev,
                          subtitle: { ...prev.subtitle, [heroTextLang]: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      {heroTextLang === 'ar' ? 'العنوان الرئيسي' : 'Main title'}
                    </label>
                    <input
                      type="text"
                      value={heroData.title[heroTextLang]}
                      onChange={(e) =>
                        setHeroData((prev) => ({
                          ...prev,
                          title: { ...prev.title, [heroTextLang]: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      {heroTextLang === 'ar' ? 'الوصف' : 'Description'}
                    </label>
                    <textarea
                      rows={3}
                      value={heroData.description[heroTextLang]}
                      onChange={(e) =>
                        setHeroData((prev) => ({
                          ...prev,
                          description: { ...prev.description, [heroTextLang]: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      {heroTextLang === 'ar' ? 'نص الزر' : 'Button text'}
                    </label>
                    <input
                      type="text"
                      value={heroData.ctaText[heroTextLang]}
                      onChange={(e) =>
                        setHeroData((prev) => ({
                          ...prev,
                          ctaText: { ...prev.ctaText, [heroTextLang]: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Hero promo video */}
              <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-4">
                <h2 className="text-lg font-bold text-white">فيديو «شاهد الفيديو»</h2>
                <p className="text-dark-400 text-sm">
                  يظهر زر «شاهد الفيديو» في الهيرو فقط عند وجود رابط. يمكنك لصق رابط YouTube أو رفع ملف MP4/WebM
                  (حتى 25 MB).
                </p>
                <input
                  ref={heroVideoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={async (ev) => {
                    const file = ev.target.files?.[0];
                    ev.target.value = '';
                    if (file) await uploadHeroVideo(file);
                  }}
                />
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    رابط YouTube أو ملف مرفوع
                  </label>
                  <input
                    type="url"
                    value={heroData.videoUrl ?? ''}
                    onChange={(e) =>
                      setHeroData((prev) => ({ ...prev, videoUrl: e.target.value }))
                    }
                    placeholder="https://youtube.com/watch?v=... أو /uploads/video.mp4"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={heroVideoBusy}
                    onClick={() => heroVideoInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800 text-gold-400 border border-dark-700 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {heroVideoBusy ? 'جاري الرفع...' : 'رفع فيديو'}
                  </button>
                  {heroData.videoUrl ? (
                    <button
                      type="button"
                      onClick={() => setHeroData((prev) => ({ ...prev, videoUrl: '' }))}
                      className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30"
                    >
                      حذف الفيديو
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Hero Images */}
              <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-4">
                <input
                  ref={heroImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (ev) => {
                    const file = ev.target.files?.[0];
                    ev.target.value = '';
                    if (file) await addHeroSlideImage(file);
                  }}
                />
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">صور السلايدر</h2>
                  <button
                    type="button"
                    disabled={heroImageBusy}
                    onClick={() => heroImageInputRef.current?.click()}
                    className="flex items-center gap-2 text-gold-400 text-sm font-medium disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    {heroImageBusy ? 'جاري الرفع...' : 'إضافة صورة'}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {heroData.images.map((img, index) => (
                    <div
                      key={`${img}-${index}`}
                      className="relative group aspect-video rounded-xl overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="p-2 rounded-lg bg-dark-900/80 text-white opacity-85">
                          <GripVertical className="w-4 h-4" />
                        </span>
                        <button
                          type="button"
                          aria-label={`حذف الصورة ${index + 1}`}
                          className="p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500"
                          onClick={() =>
                            setHeroData((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index),
                            }))
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={heroImageBusy}
                    onClick={() => heroImageInputRef.current?.click()}
                    className="aspect-video rounded-xl border-2 border-dashed border-dark-700 flex items-center justify-center cursor-pointer hover:border-gold-500/50 transition-colors disabled:opacity-50"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-dark-500 mx-auto mb-2" />
                      <span className="text-dark-500 text-sm">
                        {heroImageBusy ? 'انتظر...' : 'إضافة صورة'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Hero Stats */}
              <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h2 className="text-lg font-bold text-white">الإحصائيات</h2>
                  <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={heroData.showStats !== false}
                      onChange={(e) =>
                        setHeroData((prev) => ({ ...prev, showStats: e.target.checked }))
                      }
                      className="rounded border-dark-600 bg-dark-800 text-gold-500 focus:ring-gold-500/40"
                    />
                    إظهار الإحصائيات (الهيدر + من نحن + خدماتنا)
                  </label>
                  <button
                    type="button"
                    className="flex items-center gap-2 text-gold-400 text-sm font-medium"
                    onClick={() =>
                      setHeroData((prev) => ({
                        ...prev,
                        stats: [...prev.stats, { value: '', label: { ar: '', en: '' } }],
                      }))
                    }
                  >
                    <Plus className="w-4 h-4" />
                    إضافة إحصائية
                  </button>
                </div>

                <div className="space-y-3">
                  {heroData.stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-dark-800 rounded-xl">
                      <GripVertical className="w-5 h-5 text-dark-500 shrink-0" />
                      <input
                        type="text"
                        value={stat.value}
                        placeholder="١٥٠+"
                        onChange={(e) =>
                          setHeroData((prev) => {
                            const stats = [...prev.stats];
                            stats[index] = { ...stats[index], value: e.target.value };
                            return { ...prev, stats };
                          })
                        }
                        className="w-24 shrink-0 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-center font-bold"
                      />
                      <input
                        type="text"
                        value={stat.label[heroTextLang]}
                        placeholder={heroTextLang === 'ar' ? 'التسمية' : 'Label'}
                        onChange={(e) =>
                          setHeroData((prev) => {
                            const stats = [...prev.stats];
                            stats[index] = {
                              ...stats[index],
                              label: {
                                ...stats[index].label,
                                [heroTextLang]: e.target.value,
                              },
                            };
                            return { ...prev, stats };
                          })
                        }
                        className="flex-1 min-w-0 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                      />
                      <button
                        type="button"
                        aria-label={`حذف الإحصائية ${index + 1}`}
                        className="p-2 shrink-0 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30"
                        onClick={() =>
                          setHeroData((prev) => ({
                            ...prev,
                            stats: prev.stats.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'about' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-6">
                <h2 className="text-lg font-bold text-white">قسم من نحن</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      العنوان الفرعي
                    </label>
                    <input
                      type="text"
                      value={aboutData.subtitle.ar}
                      onChange={(e) => setAboutData(prev => ({
                        ...prev,
                        subtitle: { ...prev.subtitle, ar: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      العنوان الرئيسي
                    </label>
                    <input
                      type="text"
                      value={aboutData.title.ar}
                      onChange={(e) => setAboutData(prev => ({
                        ...prev,
                        title: { ...prev.title, ar: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      الوصف
                    </label>
                    <textarea
                      rows={4}
                      value={aboutData.description.ar}
                      onChange={(e) => setAboutData(prev => ({
                        ...prev,
                        description: { ...prev.description, ar: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      صورة القسم
                    </label>
                    <input
                      ref={aboutImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (ev) => {
                        const file = ev.target.files?.[0];
                        ev.target.value = '';
                        if (file) await uploadAboutImage(file);
                      }}
                    />
                    <div className="flex items-center gap-4">
                      {aboutData.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={aboutData.image}
                          alt=""
                          className="w-32 h-32 object-cover rounded-xl shrink-0"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-xl bg-dark-800 border border-dark-700 shrink-0" />
                      )}
                      <button
                        type="button"
                        disabled={aboutImageBusy}
                        onClick={() => aboutImageInputRef.current?.click()}
                        className="flex-1 border-2 border-dashed border-dark-700 rounded-xl p-6 text-center cursor-pointer hover:border-gold-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload className="w-8 h-8 text-dark-500 mx-auto mb-2" />
                        <p className="text-dark-500 text-sm">
                          {aboutImageBusy ? 'جاري الرفع...' : 'تغيير الصورة'}
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">الرؤية والمهمة والقيم</h2>
                </div>

                <div className="space-y-4">
                  {aboutData.features.map((feature, index) => (
                    <div key={index} className="p-4 bg-dark-800 rounded-xl space-y-3">
                      <input
                        type="text"
                        value={feature.title.ar}
                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white font-bold"
                        placeholder="العنوان"
                      />
                      <textarea
                        rows={2}
                        value={feature.text.ar}
                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white resize-none"
                        placeholder="النص"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'services' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-900 rounded-2xl border border-dark-800 p-6"
            >
              <h2 className="text-lg font-bold text-white mb-6">قسم الخدمات</h2>
              <p className="text-dark-400">
                لتغيير صورة كل خدمة: افتح إدارة الخدمات → تعديل → «رفع صورة» ثم احفظ.
              </p>
              <Link
                href="/admin/services"
                className="mt-4 inline-flex items-center gap-2 text-gold-400 font-medium hover:text-gold-300"
              >
                الذهاب لإدارة الخدمات ←
              </Link>
            </motion.div>
          )}

          {activeSection === 'footer' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-6"
            >
              <h2 className="text-lg font-bold text-white">تعديل الفوتر</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    حقوق النشر (عربي)
                  </label>
                  <input
                    type="text"
                    value={footerData.copyright.ar}
                    onChange={(e) =>
                      setFooterData((prev) => ({
                        ...prev,
                        copyright: { ...prev.copyright, ar: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Copyright (English)
                  </label>
                  <input
                    type="text"
                    value={footerData.copyright.en}
                    onChange={(e) =>
                      setFooterData((prev) => ({
                        ...prev,
                        copyright: { ...prev.copyright, en: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    وصف الشركة (عربي)
                  </label>
                  <textarea
                    rows={3}
                    value={footerData.companyBlurb.ar}
                    onChange={(e) =>
                      setFooterData((prev) => ({
                        ...prev,
                        companyBlurb: { ...prev.companyBlurb, ar: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Company blurb (English)
                  </label>
                  <textarea
                    rows={3}
                    value={footerData.companyBlurb.en}
                    onChange={(e) =>
                      setFooterData((prev) => ({
                        ...prev,
                        companyBlurb: { ...prev.companyBlurb, en: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl">
                <span className="text-white">إظهار النشرة البريدية</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={footerData.showNewsletter}
                    onChange={(e) =>
                      setFooterData((prev) => ({ ...prev, showNewsletter: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                </label>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
