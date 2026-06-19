'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Link2,
  BarChart3,
  Globe,
  Smartphone,
  ExternalLink,
  Check,
} from 'lucide-react';
import {
  buildMarketerUrl,
  countryLabel,
  deviceTypeLabel,
  slugifyMarketer,
  type DeviceType,
} from '@/lib/marketer-utils';

type MarketerRow = {
  id: number;
  name: string;
  slug: string;
  enabled: boolean;
  notes: string;
  clickCount: number;
};

type MarketerDetail = {
  marketer: MarketerRow;
  stats: {
    total: number;
    byCountry: { country: string; count: number }[];
    byDevice: { deviceType: string; count: number }[];
    byPath: { path: string; count: number }[];
    recentClicks: Array<{
      id: number;
      path: string;
      projectId: number | null;
      country: string;
      deviceType: string;
      createdAt: string;
    }>;
  };
  projects: Array<{ id: number; titleAr: string; titleEn: string }>;
};

function siteOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
}

export default function AdminMarketingPage() {
  const [marketers, setMarketers] = useState<MarketerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<MarketerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [form, setForm] = useState({ name: '', slug: '', notes: '' });

  const origin = useMemo(() => siteOrigin(), []);

  const loadMarketers = useCallback(async () => {
    const res = await fetch('/api/marketers', { credentials: 'include' });
    if (!res.ok) {
      setMarketers([]);
      return;
    }
    setMarketers((await res.json()) as MarketerRow[]);
  }, []);

  const loadDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/marketers/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      setDetail((await res.json()) as MarketerDetail);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadMarketers();
      setLoading(false);
    })();
  }, [loadMarketers]);

  useEffect(() => {
    if (expandedId != null) void loadDetail(expandedId);
    else setDetail(null);
  }, [expandedId, loadDetail]);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(''), 2000);
    } catch {
      window.prompt('انسخ الرابط:', text);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      window.alert('اسم المسوق مطلوب');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/marketers', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || slugifyMarketer(form.name),
          notes: form.notes.trim(),
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || 'fail');
      }
      setForm({ name: '', slug: '', notes: '' });
      await loadMarketers();
    } catch (e) {
      window.alert(
        e instanceof Error && e.message === 'Slug already exists'
          ? 'الرمز مستخدم مسبقاً'
          : 'فشل إنشاء المسوق',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`حذف المسوق "${name}" وجميع إحصائياته؟`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/marketers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      if (expandedId === id) setExpandedId(null);
      await loadMarketers();
    } catch {
      window.alert('تعذر الحذف');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-gold-500">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">التسويق والمسوقين</h1>
        <p className="text-dark-400 mt-1">
          أنشئ رابطاً لكل مسوق — يُحسب كل زيارة عبر الرابط (الدولة ونوع الجهاز).
        </p>
      </div>

      <div className="glass rounded-2xl border border-dark-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-gold-400" />
          إضافة مسوق
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-dark-300 text-sm mb-2">اسم المسوق</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                  slug: f.slug || slugifyMarketer(e.target.value),
                }))
              }
              placeholder="مثال: أحمد محمد"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block text-dark-300 text-sm mb-2">رمز الرابط (إنجليزي)</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
              placeholder="ahmed"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-dark-300 text-sm mb-2">ملاحظات (اختياري)</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
            />
          </div>
        </div>
        <motion.button
          type="button"
          disabled={saving}
          onClick={() => void handleCreate()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold rounded-xl disabled:opacity-60"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          إنشاء المسوق
        </motion.button>
      </div>

      <div className="space-y-4">
        {marketers.length === 0 ? (
          <div className="text-center py-16 text-dark-400 rounded-2xl border border-dashed border-dark-700">
            لا يوجد مسوقون بعد — أضف أول مسوق من الأعلى
          </div>
        ) : (
          marketers.map((m) => {
            const open = expandedId === m.id;
            const homeLink = buildMarketerUrl(origin, m.slug, '/');

            return (
              <div key={m.id} className="glass rounded-2xl border border-dark-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(open ? null : m.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-start hover:bg-dark-800/40 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 rounded-xl bg-gold-500/20">
                      <Link2 className="w-6 h-6 text-gold-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{m.name}</h3>
                      <p className="text-dark-400 text-sm font-mono truncate">?ref={m.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center px-4 py-2 rounded-xl bg-dark-800">
                      <div className="text-2xl font-bold text-gold-400">{m.clickCount}</div>
                      <div className="text-xs text-dark-400">نقرة</div>
                    </div>
                    {open ? (
                      <ChevronUp className="w-5 h-5 text-dark-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-dark-400" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-dark-800"
                    >
                      <div className="p-5 space-y-6">
                        <div>
                          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gold-400" />
                            رابط الموقع الرئيسي
                          </h4>
                          <div className="flex flex-wrap items-center gap-2">
                            <code className="flex-1 min-w-0 text-sm text-dark-300 bg-dark-900 px-3 py-2 rounded-lg truncate">
                              {homeLink}
                            </code>
                            <button
                              type="button"
                              onClick={() => void copyText(homeLink, `home-${m.id}`)}
                              className="p-2 rounded-lg bg-dark-800 text-gold-400 hover:bg-dark-700"
                            >
                              {copiedKey === `home-${m.id}` ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                <Copy className="w-5 h-5" />
                              )}
                            </button>
                            <a
                              href={homeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-dark-800 text-dark-300 hover:text-white"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          </div>
                        </div>

                        {detail?.marketer.id === m.id && detail.projects.length > 0 ? (
                          <div>
                            <h4 className="text-white font-medium mb-3">روابط المشاريع</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {detail.projects.map((p) => {
                                const link = buildMarketerUrl(origin, m.slug, `/projects/${p.id}`);
                                const key = `p-${m.id}-${p.id}`;
                                return (
                                  <div
                                    key={p.id}
                                    className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-dark-900/60"
                                  >
                                    <span className="text-white text-sm flex-1 min-w-[120px] truncate">
                                      {p.titleAr}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => void copyText(link, key)}
                                      className="p-2 rounded-lg bg-dark-800 text-gold-400"
                                    >
                                      {copiedKey === key ? (
                                        <Check className="w-4 h-4" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}

                        {detailLoading && detail?.marketer.id !== m.id ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
                          </div>
                        ) : detail?.marketer.id === m.id ? (
                          <div className="grid lg:grid-cols-2 gap-6">
                            <div className="rounded-xl bg-dark-900/60 p-4">
                              <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gold-400" />
                                حسب الدولة
                              </h4>
                              {detail.stats.byCountry.length === 0 ? (
                                <p className="text-dark-500 text-sm">لا توجد نقرات بعد</p>
                              ) : (
                                <ul className="space-y-2">
                                  {detail.stats.byCountry.map((r) => (
                                    <li
                                      key={r.country}
                                      className="flex justify-between text-sm text-dark-300"
                                    >
                                      <span>{countryLabel(r.country, 'ar')}</span>
                                      <span className="text-gold-400 font-bold">{r.count}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <div className="rounded-xl bg-dark-900/60 p-4">
                              <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-gold-400" />
                                نوع الجهاز
                              </h4>
                              {detail.stats.byDevice.length === 0 ? (
                                <p className="text-dark-500 text-sm">لا توجد نقرات بعد</p>
                              ) : (
                                <ul className="space-y-2">
                                  {detail.stats.byDevice.map((r) => (
                                    <li
                                      key={r.deviceType}
                                      className="flex justify-between text-sm text-dark-300"
                                    >
                                      <span>
                                        {deviceTypeLabel(r.deviceType as DeviceType, 'ar')}
                                      </span>
                                      <span className="text-gold-400 font-bold">{r.count}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <div className="lg:col-span-2 rounded-xl bg-dark-900/60 p-4">
                              <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-gold-400" />
                                آخر الزيارات
                              </h4>
                              {detail.stats.recentClicks.length === 0 ? (
                                <p className="text-dark-500 text-sm">
                                  شارك الرابط مع المسوق لتظهر الإحصائيات
                                </p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm text-dark-300">
                                    <thead>
                                      <tr className="text-dark-500 border-b border-dark-700">
                                        <th className="py-2 text-start">التاريخ</th>
                                        <th className="py-2 text-start">الصفحة</th>
                                        <th className="py-2 text-start">الدولة</th>
                                        <th className="py-2 text-start">الجهاز</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detail.stats.recentClicks.map((c) => (
                                        <tr key={c.id} className="border-b border-dark-800/80">
                                          <td className="py-2 whitespace-nowrap">
                                            {new Date(c.createdAt).toLocaleString('ar-SA')}
                                          </td>
                                          <td className="py-2 font-mono text-xs">{c.path}</td>
                                          <td className="py-2">{countryLabel(c.country, 'ar')}</td>
                                          <td className="py-2">
                                            {deviceTypeLabel(c.deviceType as DeviceType, 'ar')}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null}

                        <div className="flex justify-end">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void handleDelete(m.id, m.name)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف المسوق
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      <div className="rounded-xl border border-gold-500/20 bg-gold-500/5 p-4 text-dark-300 text-sm">
        <p className="font-medium text-gold-400 mb-2">كيف يعمل؟</p>
        <ul className="list-disc list-inside space-y-1 text-dark-400">
          <li>كل مسوق له رمز فريد: <code className="text-gold-400">?ref=الرمز</code></li>
          <li>رابط الموقع: <code className="text-gold-400">yoursite.com/?ref=ahmed</code></li>
          <li>رابط مشروع: <code className="text-gold-400">yoursite.com/projects/7?ref=ahmed</code></li>
          <li>الدولة تُحدَّد عبر Cloudflare إن وُجد، ونوع الجهاز من المتصفح</li>
        </ul>
      </div>
    </div>
  );
}
