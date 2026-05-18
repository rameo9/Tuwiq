'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Trash2,
  Upload,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import { uploadAdminFile } from '@/lib/client-upload';

type GalleryRow = {
  id: number;
  src: string;
  titleAr: string;
  titleEn: string;
  category: string;
  size: string;
  sortOrder: number;
};

const categories = [
  { id: 'all', label: { ar: 'الكل', en: 'All' } },
  { id: 'villas', label: { ar: 'فلل', en: 'Villas' } },
  { id: 'interior', label: { ar: 'داخلي', en: 'Interior' } },
  { id: 'exterior', label: { ar: 'خارجي', en: 'Exterior' } },
  { id: 'amenities', label: { ar: 'مرافق', en: 'Amenities' } },
];

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    titleAr: '',
    titleEn: '',
    category: 'interior',
    src: '',
  });

  const load = async () => {
    const res = await fetch('/api/gallery');
    if (!res.ok) return;
    const rows = (await res.json()) as GalleryRow[];
    setItems(rows);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered =
    activeCategory === 'all'
      ? items
      : items.filter((img) => img.category === activeCategory);

  const uploadFile = (file: File) => uploadAdminFile(file);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;
    setSyncing(true);
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      window.alert('تعذر الحذف');
    } finally {
      setSyncing(false);
    }
  };

  const submitNew = async () => {
    setSyncing(true);
    try {
      const src = form.src.trim();
      if (!src) {
        window.alert('أضف رابط الصورة أو ارفع ملفاً');
        return;
      }
      const res = await fetch('/api/gallery', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          src,
          titleAr: form.titleAr.trim(),
          titleEn: form.titleEn.trim(),
          category: form.category,
          size: 'medium',
        }),
      });
      if (!res.ok) throw new Error();
      setModalOpen(false);
      setForm({ titleAr: '', titleEn: '', category: 'interior', src: '' });
      await load();
    } catch {
      window.alert('فشل الإضافة');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">معرض الصور</h1>
          <p className="text-dark-400 mt-1">محفوظ في قاعدة البيانات ويظهر في الصفحة الرئيسية</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-dark-800 text-white rounded-xl border border-dark-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            <span>إضافة صورة</span>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => void load()}
            disabled={loading || syncing}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold rounded-xl disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading || syncing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>تحديث</span>
          </motion.button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-gold-500 text-dark-900'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            {cat.label.ar}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gold-500">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <motion.div
            role="button"
            tabIndex={0}
            onClick={() => setModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setModalOpen(true);
            }}
            className="aspect-square rounded-2xl border-2 border-dashed border-dark-700 flex flex-col items-center justify-center cursor-pointer hover:border-gold-500/50 transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            <Plus className="w-10 h-10 text-dark-500 mb-2" />
            <span className="text-dark-500 text-sm">إضافة صورة</span>
          </motion.div>

          {filtered.map((img) => (
            <motion.div
              key={img.id}
              layout
              className="relative group aspect-square rounded-2xl overflow-hidden border border-dark-800 bg-dark-900"
            >
              <img src={img.src} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2">
                <p className="text-white text-xs truncate">{img.titleAr}</p>
                <button
                  type="button"
                  onClick={() => void handleDelete(img.id)}
                  className="w-full py-2 rounded-lg bg-red-500/80 text-white text-xs flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> حذف
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">صورة جديدة</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-dark-800"
              >
                <X className="w-5 h-5 text-dark-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-dark-400 text-sm">العنوان عربي</label>
                <input
                  className="w-full mt-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
                  value={form.titleAr}
                  onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-dark-400 text-sm">Title EN</label>
                <input
                  className="w-full mt-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
                  value={form.titleEn}
                  onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-dark-400 text-sm">التصنيف</label>
                <select
                  className="w-full mt-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  <option value="villas">فلل</option>
                  <option value="interior">داخلي</option>
                  <option value="exterior">خارجي</option>
                  <option value="amenities">مرافق</option>
                </select>
              </div>
              <div>
                <label className="text-dark-400 text-sm">رابط الصورة</label>
                <input
                  className="w-full mt-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
                  placeholder="https:// أو ارفع أدناه"
                  value={form.src}
                  onChange={(e) => setForm((f) => ({ ...f, src: e.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-dark-600 rounded-xl cursor-pointer text-dark-300 hover:border-gold-500/40">
                <Upload className="w-5 h-5" />
                <span>رفع ملف صورة</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadFile(file);
                      setForm((f) => ({ ...f, src: url }));
                    } catch (err) {
                      window.alert(err instanceof Error ? err.message : 'فشل الرفع');
                    }
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-dark-700 text-dark-300"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={syncing}
                onClick={() => void submitNew()}
                className="px-4 py-2 rounded-xl bg-gold-500 text-dark-900 font-bold disabled:opacity-60"
              >
                حفظ
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
