'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, GripVertical, Globe, Loader2 } from 'lucide-react';
import {
  SOCIAL_PLATFORM_LABELS,
  socialIconMap,
  getSocialHref,
} from '@/lib/social';

type ApiSocialRow = {
  id: number;
  platform: string;
  url: string;
  enabled: boolean;
  sortOrder: number;
};

type UiRow = {
  key: string;
  platform: string;
  url: string;
  enabled: boolean;
};

export default function AdminSocial() {
  const [rows, setRows] = useState<UiRow[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const platformLabels = SOCIAL_PLATFORM_LABELS;

  const load = async () => {
    const [sRes, siteRes] = await Promise.all([
      fetch('/api/social?all=1', { credentials: 'include' }),
      fetch('/api/cms/site', { credentials: 'include' }),
    ]);
    if (sRes.ok) {
      const data = (await sRes.json()) as ApiSocialRow[];
      setRows(
        data.map((r) => ({
          key: `db-${r.id}`,
          platform: r.platform,
          url: r.url,
          enabled: r.enabled,
        })),
      );
    } else {
      setRows([]);
    }
    if (siteRes.ok) {
      const site = (await siteRes.json()) as { whatsappNumber?: string };
      setWhatsappNumber(site.whatsappNumber ?? '');
    }
  };

  useEffect(() => {
    let c = false;
    (async () => {
      setLoading(true);
      await load();
      if (!c) setLoading(false);
    })();
    return () => {
      c = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const links = rows.map((r) => ({
        platform: r.platform.trim(),
        url: r.url.trim(),
        enabled: r.enabled,
      }));
      const socialRes = await fetch('/api/social', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links }),
      });
      if (!socialRes.ok) throw new Error('social');

      const digits = whatsappNumber.replace(/\D/g, '');
      const siteRes = await fetch('/api/cms/site', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber: digits || whatsappNumber.trim() }),
      });
      if (!siteRes.ok) throw new Error('site');

      await load();
      window.alert('تم حفظ الروابط ورقم الواتساب.');
    } catch {
      window.alert('تعذر الحفظ. تأكد من صلاحياتك أو البيانات.');
    } finally {
      setSaving(false);
    }
  };

  const updateLink = (key: string, field: keyof UiRow, value: string | boolean) => {
    setRows((prev) =>
      prev.map((link) => (link.key === key ? { ...link, [field]: value } : link)),
    );
  };

  const deleteLink = (key: string) => {
    setRows((prev) => prev.filter((link) => link.key !== key));
  };

  const addLink = () => {
    setRows((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}`,
        platform: 'website',
        url: '',
        enabled: true,
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">الروابط الاجتماعية</h1>
          <p className="text-dark-400 mt-1">
            تُحفظ في قاعدة البيانات وتظهر في التذييل وصفحة التواصل
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => void handleSave()}
          disabled={loading || saving}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold rounded-xl disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>حفظ التغييرات</span>
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gold-500">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">حسابات التواصل</h2>
              <motion.button
                type="button"
                onClick={addLink}
                className="flex items-center gap-2 px-4 py-2 bg-dark-800 text-gold-400 rounded-xl hover:bg-dark-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                <span>إضافة رابط</span>
              </motion.button>
            </div>

            <div className="space-y-3">
              {rows.map((link, index) => {
                const Icon = socialIconMap[link.platform] || Globe;
                return (
                  <motion.div
                    key={link.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.4) }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                      link.enabled
                        ? 'bg-dark-800/50 border-dark-700'
                        : 'bg-dark-900 border-dark-800 opacity-60'
                    }`}
                  >
                    <GripVertical className="w-5 h-5 text-dark-500 shrink-0" aria-hidden />

                    <div className={`p-3 rounded-xl ${link.enabled ? 'bg-dark-700' : 'bg-dark-800'}`}>
                      <Icon className={`w-6 h-6 ${link.enabled ? 'text-gold-400' : 'text-dark-500'}`} />
                    </div>

                    <select
                      value={link.platform}
                      onChange={(e) => updateLink(link.key, 'platform', e.target.value)}
                      className="w-36 shrink-0 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-gold-500/50"
                    >
                      {Object.entries(platformLabels).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.ar}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink(link.key, 'url', e.target.value)}
                      placeholder="أدخل الرابط أو رقم الواتساب..."
                      className="flex-1 min-w-0 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-gold-500/50"
                    />

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={link.enabled}
                        onChange={(e) => updateLink(link.key, 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500" />
                    </label>

                    <motion.button
                      type="button"
                      onClick={() => deleteLink(link.key)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 shrink-0"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white mb-2">رقم الواتساب (الزر العائم)</h2>
            <p className="text-dark-500 text-sm mb-4">
              يُستخدم في الصفحة الرئيسية لزر الواتساب العائم؛ يُحفظ مع زر «حفظ التغييرات» أعلاه (نفس قيمة
              الإعدادات العامة).
            </p>

            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">
                الرقم (بدون + أو معها؛ سيُحوَّل لصيغة wa.me)
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full max-w-md px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                placeholder="966551234567"
              />
            </div>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6">
            <h2 className="text-lg font-bold text-white mb-4">معاينة الروابط النشطة</h2>
            <div className="flex flex-wrap items-center justify-center gap-4 py-8 bg-dark-800 rounded-xl">
              {rows
                .filter((link) => link.enabled && link.url.trim())
                .map((link) => {
                  const Icon = socialIconMap[link.platform] || Globe;
                  const href = getSocialHref(link.platform, link.url);
                  return (
                    <motion.a
                      key={link.key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-dark-700 hover:bg-gold-500 text-dark-300 hover:text-dark-900 transition-colors"
                      whileHover={{ scale: 1.1, y: -3 }}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.a>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
