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
  LayoutTemplate,
} from 'lucide-react';
import MarketingTabs from '@/components/admin/MarketingTabs';
import {
  buildCampaignLandingUrl,
  campaignLinkTypeLabel,
  slugifyCampaignLanding,
  type CampaignLinkType,
} from '@/lib/campaign-landing';
import { countryLabel, deviceTypeLabel } from '@/lib/marketer-utils';

type LinkRow = {
  id?: number;
  type: CampaignLinkType;
  titleAr: string;
  titleEn: string;
  url: string;
  projectId: number | null;
  sortOrder: number;
  enabled: boolean;
  clickCount?: number;
};

type LandingRow = {
  id: number;
  name: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  enabled: boolean;
  viewCount: number;
  totalLinkClicks: number;
  links: LinkRow[];
};

type LandingDetail = {
  landing: LandingRow;
  stats: {
    viewCount: number;
    totalClicks: number;
    byCountry: { country: string; count: number }[];
    byDevice: { deviceType: string; count: number }[];
    linkStats: Array<{
      linkId: number;
      clickCount: number;
      byCountry: { country: string; count: number }[];
      byDevice: { deviceType: string; count: number }[];
    }>;
    recentClicks: Array<{
      id: number;
      linkTitleAr: string;
      linkType: string;
      country: string;
      deviceType: string;
      createdAt: string;
    }>;
  };
  projects: Array<{ id: number; titleAr: string; titleEn: string }>;
};

const emptyLink = (): LinkRow => ({
  type: 'whatsapp',
  titleAr: 'خدمة العملاء',
  titleEn: 'Customer Service',
  url: '',
  projectId: null,
  sortOrder: 0,
  enabled: true,
});

function siteOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
}

export default function AdminLandingsPage() {
  const [landings, setLandings] = useState<LandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<LandingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [projects, setProjects] = useState<Array<{ id: number; titleAr: string; titleEn: string }>>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    links: [emptyLink()] as LinkRow[],
  });

  const origin = useMemo(() => siteOrigin(), []);

  const loadLandings = useCallback(async () => {
    const res = await fetch('/api/campaign-landings', { credentials: 'include' });
    if (!res.ok) {
      setLandings([]);
      return;
    }
    setLandings((await res.json()) as LandingRow[]);
  }, []);

  const loadDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/campaign-landings/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as LandingDetail;
      setDetail(data);
      setProjects(data.projects);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadLandings();
      try {
        const res = await fetch('/api/projects', { credentials: 'include' });
        if (res.ok) {
          const rows = (await res.json()) as Array<{
            id: number;
            titleAr: string;
            titleEn: string;
          }>;
          setProjects(rows.map((p) => ({ id: p.id, titleAr: p.titleAr, titleEn: p.titleEn })));
        }
      } catch {
        /* ignore */
      }
      setLoading(false);
    })();
  }, [loadLandings]);

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

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      slug: '',
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      links: [emptyLink()],
    });
  };

  const startEdit = (landing: LandingRow) => {
    setEditingId(landing.id);
    setForm({
      name: landing.name,
      slug: landing.slug,
      titleAr: landing.titleAr,
      titleEn: landing.titleEn,
      descriptionAr: landing.descriptionAr,
      descriptionEn: landing.descriptionEn,
      links:
        landing.links.length > 0
          ? landing.links.map((l, i) => ({ ...l, sortOrder: i }))
          : [emptyLink()],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.titleAr.trim()) {
      window.alert('اسم الحملة والعنوان بالعربي مطلوبان');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugifyCampaignLanding(form.name),
        titleAr: form.titleAr.trim(),
        titleEn: form.titleEn.trim() || form.titleAr.trim(),
        descriptionAr: form.descriptionAr.trim(),
        descriptionEn: form.descriptionEn.trim(),
        links: form.links.map((l, i) => ({ ...l, sortOrder: i })),
      };

      const url = editingId
        ? `/api/campaign-landings/${editingId}`
        : '/api/campaign-landings';
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || 'fail');
      }

      resetForm();
      await loadLandings();
      if (expandedId != null) await loadDetail(expandedId);
    } catch (e) {
      window.alert(
        e instanceof Error && e.message === 'Slug already exists'
          ? 'الرمز مستخدم مسبقاً'
          : 'فشل الحفظ',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`حذف صفحة "${name}" وجميع إحصائياتها؟`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/campaign-landings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      if (expandedId === id) setExpandedId(null);
      if (editingId === id) resetForm();
      await loadLandings();
    } catch {
      window.alert('تعذر الحذف');
    } finally {
      setSaving(false);
    }
  };

  const updateLink = (index: number, patch: Partial<LinkRow>) => {
    setForm((f) => ({
      ...f,
      links: f.links.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }));
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
      <div className="space-y-4">
        <MarketingTabs />
        <div>
          <h1 className="text-2xl font-bold text-white">صفحات الهبوط</h1>
          <p className="text-dark-400 mt-1">
            أنشئ صفحة روابط للحملة — واتساب، خريطة، مشروع — مع إحصائيات لكل رابط.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-dark-800 p-6 space-y-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          {editingId ? (
            <>تعديل صفحة الهبوط</>
          ) : (
            <>
              <Plus className="w-5 h-5 text-gold-400" />
              إنشاء صفحة هبوط
            </>
          )}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-dark-300 text-sm mb-2">اسم الحملة (داخلي)</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                  slug: f.slug || slugifyCampaignLanding(e.target.value),
                  titleAr: f.titleAr || e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block text-dark-300 text-sm mb-2">رمز الرابط</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
              placeholder="alamein-campaign"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-dark-300 text-sm mb-2">العنوان (عربي)</label>
            <input
              type="text"
              value={form.titleAr}
              onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block text-dark-300 text-sm mb-2">العنوان (إنجليزي)</label>
            <input
              type="text"
              value={form.titleEn}
              onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-dark-300 text-sm mb-2">الوصف (عربي)</label>
            <textarea
              value={form.descriptionAr}
              onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white resize-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-white font-medium">الروابط</h3>
          {form.links.map((link, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-dark-900 border border-dark-800 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-gold-400 text-sm font-medium">رابط {index + 1}</span>
                {form.links.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        links: f.links.filter((_, i) => i !== index),
                      }))
                    }
                    className="text-red-400 text-sm hover:text-red-300"
                  >
                    حذف
                  </button>
                ) : null}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-dark-400 text-xs mb-1">النوع</label>
                  <select
                    value={link.type}
                    onChange={(e) =>
                      updateLink(index, {
                        type: e.target.value as CampaignLinkType,
                        url: '',
                        projectId: null,
                      })
                    }
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm"
                  >
                    <option value="whatsapp">واتساب</option>
                    <option value="maps">Google Maps</option>
                    <option value="project">مشروع</option>
                    <option value="url">رابط مخصص</option>
                  </select>
                </div>
                <div>
                  <label className="block text-dark-400 text-xs mb-1">العنوان (عربي)</label>
                  <input
                    type="text"
                    value={link.titleAr}
                    onChange={(e) => updateLink(index, { titleAr: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm"
                  />
                </div>
                {link.type === 'whatsapp' ? (
                  <div className="sm:col-span-2">
                    <label className="block text-dark-400 text-xs mb-1">رقم الواتساب</label>
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink(index, { url: e.target.value })}
                      placeholder="966566666337"
                      className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm font-mono"
                    />
                  </div>
                ) : null}
                {link.type === 'maps' || link.type === 'url' ? (
                  <div className="sm:col-span-2">
                    <label className="block text-dark-400 text-xs mb-1">الرابط</label>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(index, { url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm font-mono"
                    />
                  </div>
                ) : null}
                {link.type === 'project' ? (
                  <div className="sm:col-span-2">
                    <label className="block text-dark-400 text-xs mb-1">المشروع</label>
                    <select
                      value={link.projectId ?? ''}
                      onChange={(e) =>
                        updateLink(index, {
                          projectId: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm"
                    >
                      <option value="">اختر مشروعاً</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.titleAr}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, links: [...f.links, emptyLink()] }))}
            className="text-sm text-gold-400 hover:text-gold-300"
          >
            + إضافة رابط
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <motion.button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold rounded-xl disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {editingId ? 'حفظ التعديلات' : 'إنشاء الصفحة'}
          </motion.button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 rounded-xl bg-dark-800 text-dark-300 hover:text-white"
            >
              إلغاء
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {landings.length === 0 ? (
          <div className="text-center py-16 text-dark-400 rounded-2xl border border-dashed border-dark-700">
            لا توجد صفحات هبوط — أنشئ أول صفحة من الأعلى
          </div>
        ) : (
          landings.map((l) => {
            const open = expandedId === l.id;
            const pageUrl = buildCampaignLandingUrl(origin, l.slug);

            return (
              <div key={l.id} className="glass rounded-2xl border border-dark-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(open ? null : l.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-start hover:bg-dark-800/40 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 rounded-xl bg-gold-500/20">
                      <LayoutTemplate className="w-6 h-6 text-gold-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{l.name}</h3>
                      <p className="text-dark-400 text-sm font-mono truncate">/l/{l.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center px-3 py-2 rounded-xl bg-dark-800 hidden sm:block">
                      <div className="text-lg font-bold text-white">{l.viewCount}</div>
                      <div className="text-xs text-dark-400">زيارة</div>
                    </div>
                    <div className="text-center px-3 py-2 rounded-xl bg-dark-800">
                      <div className="text-lg font-bold text-gold-400">{l.totalLinkClicks}</div>
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
                        {detailLoading || !detail || detail.landing.id !== l.id ? (
                          <div className="flex justify-center py-8 text-gold-500">
                            <Loader2 className="w-8 h-8 animate-spin" />
                          </div>
                        ) : (
                          <>
                            <div>
                              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-gold-400" />
                                رابط الحملة
                              </h4>
                              <div className="flex flex-wrap items-center gap-2">
                                <code className="flex-1 min-w-0 text-sm text-dark-300 bg-dark-900 px-3 py-2 rounded-lg truncate">
                                  {pageUrl}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => void copyText(pageUrl, `page-${l.id}`)}
                                  className="p-2 rounded-lg bg-dark-800 text-gold-400 hover:bg-dark-700"
                                >
                                  {copiedKey === `page-${l.id}` ? (
                                    <Check className="w-5 h-5" />
                                  ) : (
                                    <Copy className="w-5 h-5" />
                                  )}
                                </button>
                                <a
                                  href={pageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg bg-dark-800 text-dark-300 hover:text-white"
                                >
                                  <ExternalLink className="w-5 h-5" />
                                </a>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-gold-400" />
                                إحصائيات الروابط
                              </h4>
                              <div className="space-y-2">
                                {detail.landing.links.map((link) => {
                                  const ls = detail.stats.linkStats.find(
                                    (s) => s.linkId === link.id,
                                  );
                                  return (
                                    <div
                                      key={link.id}
                                      className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-dark-900 border border-dark-800"
                                    >
                                      <div className="min-w-0">
                                        <p className="text-white font-medium truncate">
                                          {link.titleAr}
                                        </p>
                                        <p className="text-dark-500 text-xs">
                                          {campaignLinkTypeLabel(link.type)}
                                        </p>
                                      </div>
                                      <div className="text-2xl font-bold text-gold-400">
                                        {ls?.clickCount ?? link.clickCount ?? 0}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl bg-dark-900 border border-dark-800">
                                <h5 className="text-dark-400 text-sm mb-3 flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  حسب الدولة
                                </h5>
                                {detail.stats.byCountry.length === 0 ? (
                                  <p className="text-dark-500 text-sm">لا بيانات بعد</p>
                                ) : (
                                  <ul className="space-y-1 text-sm">
                                    {detail.stats.byCountry.slice(0, 8).map((r) => (
                                      <li
                                        key={r.country}
                                        className="flex justify-between text-dark-300"
                                      >
                                        <span>{countryLabel(r.country)}</span>
                                        <span className="text-gold-400">{r.count}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <div className="p-4 rounded-xl bg-dark-900 border border-dark-800">
                                <h5 className="text-dark-400 text-sm mb-3 flex items-center gap-2">
                                  <Smartphone className="w-4 h-4" />
                                  حسب الجهاز
                                </h5>
                                {detail.stats.byDevice.length === 0 ? (
                                  <p className="text-dark-500 text-sm">لا بيانات بعد</p>
                                ) : (
                                  <ul className="space-y-1 text-sm">
                                    {detail.stats.byDevice.map((r) => (
                                      <li
                                        key={r.deviceType}
                                        className="flex justify-between text-dark-300"
                                      >
                                        <span>{deviceTypeLabel(r.deviceType as 'mobile')}</span>
                                        <span className="text-gold-400">{r.count}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!detail.projects.length) void loadDetail(l.id);
                                  startEdit(l);
                                }}
                                className="px-4 py-2 rounded-lg bg-dark-800 text-gold-400 hover:bg-dark-700 text-sm"
                              >
                                تعديل
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(l.id, l.name)}
                                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                حذف
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
