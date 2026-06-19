'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Upload,
  X,
  Save,
  FileText,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { uploadAdminFile } from '@/lib/client-upload';

type ApiProject = {
  id: number;
  titleAr: string;
  titleEn: string;
  locationAr: string;
  locationEn: string;
  descriptionAr: string;
  descriptionEn: string;
  area: string;
  units: string;
  status: string;
  categoryAr: string;
  categoryEn: string;
  mainImageUrl: string;
  pdfUrl: string | null;
  completionYear: string;
  mapUrl: string | null;
  images: { url: string }[];
  features: { textAr: string; textEn: string }[];
};

type UiProject = {
  id: number;
  title: { ar: string; en: string };
  location: { ar: string; en: string };
  description: { ar: string; en: string };
  area: string;
  units: string;
  status: string;
  category: { ar: string; en: string };
  completionYear: string;
  image: string;
  mapUrl: string;
  galleryUrlsText: string;
  features: { ar: string; en: string }[];
  pdfUrl: string;
};

function mapApiToUi(p: ApiProject): UiProject {
  const extras = p.images.map((i) => i.url).filter((u) => u && u !== p.mainImageUrl);
  return {
    id: p.id,
    title: { ar: p.titleAr, en: p.titleEn },
    location: { ar: p.locationAr, en: p.locationEn },
    description: { ar: p.descriptionAr, en: p.descriptionEn },
    area: p.area,
    units: p.units,
    status: p.status,
    category: { ar: p.categoryAr, en: p.categoryEn },
    completionYear: p.completionYear || '',
    image: p.mainImageUrl,
    mapUrl: p.mapUrl || '',
    galleryUrlsText: extras.join('\n'),
    features: p.features.map((f) => ({ ar: f.textAr, en: f.textEn })),
    pdfUrl: p.pdfUrl || '',
  };
}

function emptyForm() {
  return {
    title: { ar: '', en: '' },
    location: { ar: '', en: '' },
    description: { ar: '', en: '' },
    area: '',
    units: '',
    status: 'active',
    category: { ar: 'سكني', en: 'Residential' },
    completionYear: '',
    image: '',
    mapUrl: '',
    galleryUrlsText: '',
    features: [] as { ar: string; en: string }[],
    pdfUrl: '',
  };
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<UiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'ar' | 'en'>('ar');
  const [formData, setFormData] = useState(emptyForm());

  const load = async () => {
    const res = await fetch('/api/projects', { credentials: 'include' });
    if (!res.ok) {
      setProjects([]);
      return;
    }
    const rows = (await res.json()) as ApiProject[];
    setProjects(rows.map(mapApiToUi));
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

  const filteredProjects = projects.filter(
    (project) =>
      project.title.ar.includes(searchTerm) ||
      project.title.en.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openModal = (project?: UiProject) => {
    if (project) {
      setEditingId(project.id);
      setFormData({
        title: { ...project.title },
        location: { ...project.location },
        description: { ...project.description },
        area: project.area,
        units: project.units,
        status: project.status,
        category: { ...project.category },
        completionYear: project.completionYear,
        image: project.image,
        mapUrl: project.mapUrl,
        galleryUrlsText: project.galleryUrlsText,
        features: project.features.map((f) => ({ ...f })),
        pdfUrl: project.pdfUrl,
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm());
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const uploadFile = (file: File) => uploadAdminFile(file);

  const buildBody = () => {
    const galleryUrls = formData.galleryUrlsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      title: formData.title,
      location: formData.location,
      description: formData.description,
      area: formData.area,
      units: formData.units,
      status: formData.status,
      category: formData.category,
      image: formData.image.trim(),
      mainImageUrl: formData.image.trim(),
      galleryUrls,
      images: galleryUrls,
      features: formData.features,
      pdfUrl: formData.pdfUrl.trim() || null,
      completionYear: formData.completionYear.trim(),
      mapUrl: formData.mapUrl.trim() || null,
    };
  };

  const handleSave = async () => {
    const body = buildBody();
    if (!body.title.ar || !body.title.en || !body.image) {
      window.alert('عنوان عربي/إنجليزي والصورة الرئيسية مطلوبة');
      return;
    }
    setSaving(true);
    try {
      if (editingId != null) {
        const res = await fetch(`/api/projects/${editingId}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch('/api/projects', {
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
      window.alert('فشل حفظ المشروع');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      window.alert('تعذر الحذف');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { ar: '', en: '' }],
    }));
  };

  const updateFeature = (index: number, lang: 'ar' | 'en', value: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? { ...f, [lang]: value } : f)),
    }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة المشاريع</h1>
          <p className="text-dark-400 mt-1">البيانات من قاعدة البيانات وتظهر في الموقع مباشرة</p>
        </div>
        <motion.button
          type="button"
          onClick={() => openModal()}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold rounded-xl disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          <span>إضافة مشروع</span>
        </motion.button>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
        <input
          type="text"
          placeholder="البحث في المشاريع..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-12 py-3 bg-dark-900 border border-dark-800 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-gold-500/50"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gold-500">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-dark-900 rounded-2xl overflow-hidden border border-dark-800 group"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title.ar}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-dark-900/80 text-gold-400">
                  {project.status}
                </span>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => window.open(`/projects/${project.id}`, '_blank')}
                    className="p-2 rounded-lg bg-dark-900/80 text-white hover:bg-dark-800"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal(project)}
                    className="p-2 rounded-lg bg-dark-900/80 text-white hover:bg-dark-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(project.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-2">{project.title.ar}</h3>
                <div className="flex items-center gap-2 text-dark-400 text-sm mb-4">
                  <MapPin className="w-4 h-4 text-gold-400" />
                  <span>{project.location.ar}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-500">
                    المساحة: <span className="text-white">{project.area}</span>
                  </span>
                  <span className="text-dark-500">
                    الوحدات: <span className="text-white">{project.units}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-dark-900 rounded-2xl border border-dark-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-dark-900 border-b border-dark-800 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingId != null ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
                </h2>
                <button type="button" onClick={closeModal} className="p-2 rounded-lg hover:bg-dark-800">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>

              <div className="px-6 pt-4">
                <div className="flex gap-2 p-1 bg-dark-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ar')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      activeTab === 'ar'
                        ? 'bg-gold-500 text-dark-900'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('en')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      activeTab === 'en'
                        ? 'bg-gold-500 text-dark-900'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    {activeTab === 'ar' ? 'عنوان المشروع' : 'Project Title'}
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
                    {activeTab === 'ar' ? 'الموقع' : 'Location'}
                  </label>
                  <input
                    type="text"
                    value={formData.location[activeTab]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, [activeTab]: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                </div>

                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    رابط Google Maps (اختياري)
                  </label>
                  <input
                    type="url"
                    value={formData.mapUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, mapUrl: e.target.value }))
                    }
                    placeholder="رابط مشاركة أو تضمين من Google Maps"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                  />
                  <p className="text-dark-500 text-xs mt-1">
                    للدقة الأفضل: من Google Maps → مشاركة → تضمين خريطة، أو الصق رابط المكان.
                  </p>
                </div>

                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    {activeTab === 'ar' ? 'الوصف' : 'Description'}
                  </label>
                  <textarea
                    rows={4}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">التصنيف (عربي)</label>
                    <input
                      type="text"
                      value={formData.category.ar}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: { ...prev.category, ar: e.target.value },
                        }))
                      }
                      placeholder="مثل: A+ أو سكني"
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">Category EN</label>
                    <input
                      type="text"
                      value={formData.category.en}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: { ...prev.category, en: e.target.value },
                        }))
                      }
                      placeholder="e.g. A+ or Residential"
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">المساحة</label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-dark-300 text-sm font-medium mb-2">عدد الوحدات</label>
                    <input
                      type="text"
                      value={formData.units}
                      onChange={(e) => setFormData((prev) => ({ ...prev, units: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">سنة التسليم / الإنجاز</label>
                  <input
                    type="text"
                    value={formData.completionYear}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, completionYear: e.target.value }))
                    }
                    placeholder="2026"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">الحالة</label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, status: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white appearance-none"
                    >
                      <option value="active">نشط</option>
                      <option value="construction">قيد الإنشاء</option>
                      <option value="completed">مكتمل</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    الصورة الرئيسية (رابط)
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
                  />
                  <label className="mt-2 flex items-center gap-2 px-4 py-3 border border-dashed border-dark-600 rounded-xl cursor-pointer text-dark-300 hover:border-gold-500/40 text-sm">
                    <Upload className="w-4 h-4" />
                    رفع صورة رئيسية
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadFile(file);
                          setFormData((prev) => ({ ...prev, image: url }));
                        } catch {
                          window.alert('فشل الرفع');
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    معرض الصور — رابط لكل سطر (إضافية غير الرئيسية)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.galleryUrlsText}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, galleryUrlsText: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-dark-300 text-sm font-medium">
                      {activeTab === 'ar' ? 'المميزات' : 'Features'}
                    </label>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-gold-400 text-sm font-medium hover:text-gold-300"
                    >
                      + إضافة
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={feature[activeTab]}
                          onChange={(e) => updateFeature(index, activeTab, e.target.value)}
                          className="flex-1 px-4 py-2 bg-dark-800 border border-dark-700 rounded-xl text-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">رابط كتيب PDF</label>
                  <input
                    type="url"
                    value={formData.pdfUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pdfUrl: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
                  />
                  <label className="mt-2 flex items-center gap-2 px-4 py-3 border border-dashed border-dark-600 rounded-xl cursor-pointer text-dark-300 text-sm">
                    <FileText className="w-4 h-4" />
                    رفع PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadFile(file);
                          setFormData((prev) => ({ ...prev, pdfUrl: url }));
                        } catch {
                          window.alert('فشل الرفع');
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="sticky bottom-0 bg-dark-900 border-t border-dark-800 p-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl border border-dark-700 text-dark-300 hover:bg-dark-800"
                >
                  إلغاء
                </button>
                <motion.button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSave()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold rounded-xl disabled:opacity-60"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
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
