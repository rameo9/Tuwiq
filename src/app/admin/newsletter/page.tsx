'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Loader2, Mail, Download } from 'lucide-react';

type Subscriber = {
  id: number;
  email: string;
  createdAt: string;
};

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const res = await fetch('/api/newsletter', { credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) {
            setLoadError(
              res.status === 401
                ? 'انتهت الجلسة. أعد تسجيل الدخول.'
                : 'تعذر تحميل المشتركين',
            );
          }
          return;
        }
        const rows = (await res.json()) as Subscriber[];
        if (!cancelled) setSubscribers(rows);
      } catch {
        if (!cancelled) setLoadError('تعذر تحميل المشتركين');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribers, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('حذف هذا المشترك؟')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/newsletter/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('fail');
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch {
      window.alert('تعذر حذف المشترك');
    } finally {
      setDeletingId(null);
    }
  };

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const lines = ['email,subscribed_at', ...filtered.map((s) => `${s.email},${s.createdAt}`)];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">النشرة البريدية</h1>
          <p className="text-dark-400 mt-1">
            {loadError ? (
              <span className="text-red-400">{loadError}</span>
            ) : isLoading ? (
              'جاري التحميل...'
            ) : (
              `${subscribers.length} مشترك`
            )}
          </p>
        </div>
        {!isLoading && !loadError && filtered.length > 0 && (
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 text-dark-300 hover:text-white border border-dark-700 hover:border-gold-500/40 transition-colors"
          >
            <Download className="w-4 h-4" />
            تصدير CSV
          </button>
        )}
      </div>

      <div className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden">
        <div className="p-4 border-b border-dark-800">
          <div className="relative max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              type="text"
              placeholder="بحث بالبريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading || !!loadError}
              className="w-full pl-4 pr-12 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-gold-500/50 disabled:opacity-50"
            />
          </div>
        </div>

        {isLoading && (
          <div className="p-16 flex justify-center text-gold-500">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        )}

        {!isLoading && !loadError && filtered.length === 0 && (
          <div className="p-16 text-center text-dark-400">
            {subscribers.length === 0
              ? 'لا يوجد مشتركون بعد'
              : 'لا توجد نتائج للبحث'}
          </div>
        )}

        {!isLoading && !loadError && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-dark-800 text-dark-400 text-sm">
                  <th className="px-6 py-4 font-medium">#</th>
                  <th className="px-6 py-4 font-medium">البريد الإلكتروني</th>
                  <th className="px-6 py-4 font-medium">تاريخ الاشتراك</th>
                  <th className="px-6 py-4 font-medium w-20">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {filtered.map((sub, index) => (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-dark-800/50"
                  >
                    <td className="px-6 py-4 text-dark-500 text-sm">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gold-500/10">
                          <Mail className="w-4 h-4 text-gold-400" />
                        </div>
                        <a
                          href={`mailto:${sub.email}`}
                          className="text-white hover:text-gold-400 transition-colors"
                        >
                          {sub.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-300 text-sm whitespace-nowrap">
                      {formatDate(sub.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => void handleDelete(sub.id)}
                        disabled={deletingId === sub.id}
                        className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        aria-label="حذف"
                      >
                        {deletingId === sub.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
