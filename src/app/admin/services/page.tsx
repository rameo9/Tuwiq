'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Save,
  Edit,
  Trash2,
  X,
  GripVertical,
  Building2,
  MessageSquare,
  Settings,
  TrendingUp,
  Upload,
  Loader2,
} from 'lucide-react';
import { uploadAdminFile } from '@/lib/client-upload';

type ApiService = {
  id: number;
  slug: string;
  iconId: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl: string;
  enabled: boolean;
  sortOrder: number;
};

type UiService = {
  id: number;
  slug: string;
  iconId: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  imageUrl: string;
  enabled: boolean;
};

const iconOptions = [
  { id: 'building', icon: Building2, label: 'مبنى' },
  { id: 'message', icon: MessageSquare, label: 'رسالة' },
  { id: 'settings', icon: Settings, label: 'إعدادات' },
  { id: 'trending', icon: TrendingUp, label: 'نمو' },
];

function mapApi(s: ApiService): UiService {
  return {
    id: s.id,
    slug: s.slug,
    iconId: s.iconId,
    title: { ar: s.titleAr, en: s.titleEn },
    description: { ar: s.descriptionAr, en: s.descriptionEn },
    imageUrl: s.imageUrl,
    enabled: s.enabled,
  };
}

export default function AdminServices() {
  const [services, setServices] = useState<UiService[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | 'modal' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<UiService | null>(null);
  const [activeTab, setActiveTab] = useState<'ar' | 'en'>('ar');
  const [formData, setFormData] = useState({
    iconId: 'building',
    title: { ar: '', en: '' },
    description: { ar: '', en: '' },
    imageUrl: '',
    enabled: true,
  });

  const load = async () => {
    const res = await fetch('/api/services?all=1', { credentials: 'include' });
    if (!res.ok) {
      setServices([]);
      return;
    }
    const rows = (await res.json()) as ApiService[];
    setServices(rows.map(mapApi));
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

  const uploadFile = (file: File) => uploadAdminFile(file);

  const openModal = (service?: UiService) => {
    if (service) {
      setEditingService(service);
      setFormData({
        iconId: service.iconId,
        title: { ...service.title },
        description: { ...service.description },
        imageUrl: service.imageUrl,
        enabled: service.enabled,
      });
    } else {
      setEditingService(null);
      setFormData({
        iconId: 'building',
        title: { ar: '', en: '' },
        description: { ar: '', en: '' },
        imageUrl: '',
        enabled: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSaveService = async () => {
    if (!formData.title.ar.trim() || !formData.title.en.trim()) {
      window.alert('عنوان الخدمة بالعربية والإنجليزية مطلوب');
      return;
    }
    setSavingId('modal');
    try {
      const body = {
        iconId: formData.iconId,
        icon: formData.iconId,
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl.trim(),
        enabled: formData.enabled,
      };
      if (editingService) {
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch('/api/services', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
      }
      closeModal();
      await load();
    } catch {
      window.alert('فشل حفظ الخدمة');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      window.alert('تعذر الحذف');
    } finally {
      setSavingId(null);
    }
  };

  const toggleEnabled = async (service: UiService) => {
    setSavingId(service.id);
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !service.enabled }),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      window.alert('تعذر تحديث الحالة');
    } finally {
      setSavingId(null);
    }
  };

  const getIcon = (iconId: string) => {
    const found = iconOptions.find((i) => i.id === iconId);
    return found ? found.icon : Building2;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة الخدمات</h1>
          <p className="text-dark-400 mt-1">البيانات من قاعدة البيانات وتظهر في قسم الخدمات بالصفحة الرئيسية</p>
        </div>
        <motion.button
          type="button"
          disabled={loading}
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold rounded-xl disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          <span>إضافة خدمة</span>
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gold-500">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service, index) => {
            const Icon = getIcon(service.iconId);
            const busy = savingId === service.id;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.4) }}
                className={`bg-dark-900 rounded-2xl border border-dark-800 p-6 ${!service.enabled ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <GripVertical className="w-5 h-5 text-dark-500 shrink-0 mt-2" aria-hidden />

                  <div
                    className={`p-4 rounded-xl shrink-0 ${
                      service.enabled ? 'bg-gradient-to-br from-gold-500 to-gold-600' : 'bg-dark-800'
                    }`}
                  >
                    <Icon className={`w-8 h-8 ${service.enabled ? 'text-dark-900' : 'text-dark-500'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-2">{service.title.ar}</h3>
                    <p className="text-dark-400">{service.description.ar}</p>
                    <p className="text-dark-500 text-sm mt-2 truncate">
                      {service.title.en} — {service.description.en}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={service.enabled}
                        disabled={busy}
                        onChange={() => void toggleEnabled(service)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500 peer-disabled:opacity-50" />
                    </label>

                    <motion.button
                      type="button"
                      disabled={busy}
                      onClick={() => openModal(service)}
                      className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-white disabled:opacity-50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleDelete(service.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 disabled:opacity-50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-dark-900 rounded-2xl border border-dark-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-dark-800 flex items-center justify-between sticky top-0 bg-dark-900 z-10">
                <h2 className="text-xl font-bold text-white">
                  {editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
                </h2>
                <button type="button" onClick={closeModal}>
                  <X className="w-6 h-6 text-dark-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-3">الأيقونة</label>
                  <div className="flex gap-3 flex-wrap">
                    {iconOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, iconId: option.id }))}
                        className={`p-4 rounded-xl transition-colors ${
                          formData.iconId === option.id
                            ? 'bg-gradient-to-br from-gold-500 to-gold-600'
                            : 'bg-dark-800 hover:bg-dark-700'
                        }`}
                      >
                        <option.icon
                          className={`w-6 h-6 ${formData.iconId === option.id ? 'text-dark-900' : 'text-dark-400'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded border-dark-600"
                  />
                  <span className="text-dark-300 text-sm">خدمة مفعّلة وتظهر للزوار</span>
                </label>

                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">صورة الخدمة</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white mb-2"
                  />
                  <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-dark-600 rounded-xl cursor-pointer text-dark-300 hover:border-gold-500/40 text-sm">
                    <Upload className="w-4 h-4" />
                    رفع صورة
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadFile(file);
                          setFormData((prev) => ({ ...prev, imageUrl: url }));
                        } catch {
                          window.alert('فشل الرفع');
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="flex gap-2 p-1 bg-dark-800 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ar')}
                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                      activeTab === 'ar' ? 'bg-gold-500 text-dark-900' : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('en')}
                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                      activeTab === 'en' ? 'bg-gold-500 text-dark-900' : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                </div>

                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    {activeTab === 'ar' ? 'عنوان الخدمة' : 'Service Title'}
                  </label>
                  <input
                    type="text"
                    value={formData.title[activeTab]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: { ...prev.title, [activeTab]: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                </div>

                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    {activeTab === 'ar' ? 'وصف الخدمة' : 'Service Description'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description[activeTab]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: { ...prev.description, [activeTab]: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50 resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-dark-800 flex gap-3 sticky bottom-0 bg-dark-900">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border border-dark-700 text-dark-300"
                >
                  إلغاء
                </button>
                <motion.button
                  type="button"
                  disabled={savingId === 'modal'}
                  onClick={() => void handleSaveService()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {savingId === 'modal' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>حفظ</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
