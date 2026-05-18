'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { SitePayload } from '@/lib/cms-defaults';
import {
  Save,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Bell,
  Database,
  RefreshCw,
  Loader2,
} from 'lucide-react';

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState<SitePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadErr, setLoadErr] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const patchSite = (fn: (s: SitePayload) => SitePayload) => {
    setSettings((prev) => (prev ? fn(prev) : prev));
  };

  const sections = [
    { id: 'general', icon: Globe, label: 'عام' },
    { id: 'contact', icon: Mail, label: 'معلومات التواصل' },
    { id: 'seo', icon: Database, label: 'SEO' },
    { id: 'security', icon: Shield, label: 'الأمان' },
    { id: 'notifications', icon: Bell, label: 'الإشعارات' },
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadErr('');
      try {
        const res = await fetch('/api/cms/site', { credentials: 'include' });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as SitePayload;
        if (!cancelled) setSettings(data);
      } catch {
        if (!cancelled) setLoadErr('تعذر تحميل الإعدادات');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadFile = async (field: 'logo' | 'favicon', file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: fd,
      credentials: 'include',
    });
    const j = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) throw new Error(j.error || 'رفع فاشل');
    setSettings((prev) => (prev ? { ...prev, [field]: j.url ?? '' } : prev));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/cms/site', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      window.alert('تم حفظ الإعدادات بنجاح!');
    } catch {
      window.alert('فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
        {loadErr ? <p className="text-red-400">{loadErr}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">إعدادات الموقع</h1>
          <p className="text-dark-400 mt-1">تخصيص إعدادات الموقع والمظهر</p>
        </div>
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

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-4 space-y-2 sticky top-24">
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
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-6"
            >
              <h2 className="text-lg font-bold text-white mb-6">الإعدادات العامة</h2>

              {/* Site Name */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    اسم الموقع (عربي)
                  </label>
                  <input
                    type="text"
                    value={settings.siteName.ar}
                    onChange={(e) =>
                      patchSite((s) => ({
                        ...s,
                        siteName: { ...s.siteName, ar: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Site Name (English)
                  </label>
                  <input
                    type="text"
                    value={settings.siteName.en}
                    onChange={(e) =>
                      patchSite((s) => ({
                        ...s,
                        siteName: { ...s.siteName, en: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                </div>
              </div>

              {/* Site Description */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    وصف الموقع (عربي)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.siteDescription.ar}
                    onChange={(e) =>
                      patchSite((s) => ({
                        ...s,
                        siteDescription: { ...s.siteDescription, ar: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Site Description (English)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.siteDescription.en}
                    onChange={(e) =>
                      patchSite((s) => ({
                        ...s,
                        siteDescription: { ...s.siteDescription, en: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50 resize-none"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadFile('logo', f).catch(() => window.alert('فشل رفع الشعار'));
                e.target.value = '';
              }} />
              <input ref={faviconInputRef} type="file" accept="image/*,.ico" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadFile('favicon', f).catch(() => window.alert('فشل رفع الأيقونة'));
                e.target.value = '';
              }} />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    شعار الموقع
                  </label>
                  <input
                    type="url"
                    value={settings.logo}
                    onChange={(e) =>
                      setSettings((prev) => (prev ? { ...prev, logo: e.target.value } : prev))
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full py-3 rounded-xl border border-dark-700 text-dark-300 hover:bg-dark-800 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    رفع صورة الشعار
                  </button>
                  {settings.logo ? (
                    <img src={settings.logo} alt="" className="max-h-20 rounded-lg border border-dark-700" />
                  ) : null}
                </div>
                <div className="space-y-3">
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    أيقونة الموقع (Favicon)
                  </label>
                  <input
                    type="url"
                    value={settings.favicon}
                    onChange={(e) =>
                      setSettings((prev) => (prev ? { ...prev, favicon: e.target.value } : prev))
                    }
                    placeholder="/icon.svg أو رابط"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    className="w-full py-3 rounded-xl border border-dark-700 text-dark-300 hover:bg-dark-800 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    رفع أيقونة
                  </button>
                  {settings.favicon ? (
                    <img src={settings.favicon} alt="" className="max-h-12 rounded border border-dark-700" />
                  ) : null}
                </div>
              </div>

              {/* Default Settings */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    اللغة الافتراضية
                  </label>
                  <select
                    value={settings.defaultLanguage}
                    onChange={(e) =>
                      patchSite((s) => ({ ...s, defaultLanguage: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    الثيم الافتراضي
                  </label>
                  <select
                    value={settings.defaultTheme}
                    onChange={(e) =>
                      patchSite((s) => ({ ...s, defaultTheme: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  >
                    <option value="dark">داكن</option>
                    <option value="light">فاتح</option>
                  </select>
                </div>
              </div>

              {/* Maintenance Mode */}
              <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl">
                <div>
                  <h4 className="text-white font-medium">وضع الصيانة</h4>
                  <p className="text-dark-500 text-sm">تفعيل وضع الصيانة يخفي الموقع عن الزوار</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      patchSite((s) => ({ ...s, maintenanceMode: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                </label>
              </div>
            </motion.div>
          )}

          {activeSection === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-6"
            >
              <h2 className="text-lg font-bold text-white mb-6">معلومات التواصل</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    <Mail className="w-4 h-4 inline-block ml-2" />
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => patchSite((s) => ({ ...s, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                </div>

                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    <Phone className="w-4 h-4 inline-block ml-2" />
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => patchSite((s) => ({ ...s, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                </div>

                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    <Phone className="w-4 h-4 inline-block ml-2" />
                    رقم الواتساب (بدون +)
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={(e) =>
                      patchSite((s) => ({ ...s, whatsappNumber: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                    placeholder="966551234567"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      <MapPin className="w-4 h-4 inline-block ml-2" />
                      العنوان (عربي)
                    </label>
                    <input
                      type="text"
                      value={settings.address.ar}
                      onChange={(e) =>
                        patchSite((s) => ({
                          ...s,
                          address: { ...s.address, ar: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      Address (English)
                    </label>
                    <input
                      type="text"
                      value={settings.address.en}
                      onChange={(e) =>
                        patchSite((s) => ({
                          ...s,
                          address: { ...s.address, en: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      <Clock className="w-4 h-4 inline-block ml-2" />
                      ساعات العمل (عربي)
                    </label>
                    <input
                      type="text"
                      value={settings.workingHours.ar}
                      onChange={(e) =>
                        patchSite((s) => ({
                          ...s,
                          workingHours: { ...s.workingHours, ar: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      Working Hours (English)
                    </label>
                    <input
                      type="text"
                      value={settings.workingHours.en}
                      onChange={(e) =>
                        patchSite((s) => ({
                          ...s,
                          workingHours: { ...s.workingHours, en: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>

                {/* Google Maps Embed */}
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    رابط خريطة Google Maps
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.google.com/maps/embed?..."
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'seo' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-6"
            >
              <h2 className="text-lg font-bold text-white mb-6">إعدادات SEO</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    الكلمات المفتاحية
                  </label>
                  <textarea
                    rows={3}
                    value={settings.metaKeywords}
                    onChange={(e) =>
                      patchSite((s) => ({ ...s, metaKeywords: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50 resize-none"
                    placeholder="عقارات, تطوير عقاري, فلل, شقق..."
                  />
                </div>

                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={settings.analyticsId}
                    onChange={(e) =>
                      patchSite((s) => ({ ...s, analyticsId: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                    placeholder="UA-XXXXXXXXX-X"
                  />
                </div>

                <div className="p-4 bg-dark-800 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">ملف Sitemap</h4>
                    <button className="flex items-center gap-2 text-gold-400 text-sm">
                      <RefreshCw className="w-4 h-4" />
                      إعادة إنشاء
                    </button>
                  </div>
                  <p className="text-dark-500 text-sm">آخر تحديث: منذ 3 أيام</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-6"
            >
              <h2 className="text-lg font-bold text-white mb-6">إعدادات الأمان</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    كلمة المرور الحالية
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">
                      تأكيد كلمة المرور
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>

                <motion.button
                  className="px-6 py-3 bg-dark-800 text-white rounded-xl hover:bg-dark-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  تحديث كلمة المرور
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeSection === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-6"
            >
              <h2 className="text-lg font-bold text-white mb-6">إعدادات الإشعارات</h2>

              <div className="space-y-4">
                {[
                  { label: 'إشعارات الرسائل الجديدة', enabled: true },
                  { label: 'إشعارات الطلبات', enabled: true },
                  { label: 'إشعارات النظام', enabled: false },
                  { label: 'إشعارات البريد الإلكتروني', enabled: true },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-dark-800 rounded-xl">
                    <span className="text-white">{item.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
