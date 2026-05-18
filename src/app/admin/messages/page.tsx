'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Mail,
  MailOpen,
  Trash2,
  Star,
  Reply,
  X,
  Phone,
  Clock,
  Loader2,
} from 'lucide-react';

interface Message {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
}

type ApiMessageRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  isStarred: boolean;
  createdAt: string;
};

function normalizeMessage(row: ApiMessageRow): Message {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: (row.phone || '').trim() || '—',
    subject: (row.subject || '').trim() || '—',
    message: row.message,
    date: row.createdAt,
    isRead: row.isRead,
    isStarred: row.isStarred,
  };
}

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, '');
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const res = await fetch('/api/messages', { credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) {
            setLoadError(
              res.status === 401
                ? 'انتهت الجلسة. أعد تسجيل الدخول.'
                : 'تعذر تحميل الرسائل',
            );
          }
          return;
        }
        const rows: ApiMessageRow[] = await res.json();
        if (cancelled) return;
        setMessages(rows.map(normalizeMessage));
      } catch {
        if (!cancelled) setLoadError('تعذر الاتصال بالخادم');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelectedMessage((prev) => {
      if (!prev) return null;
      return messages.find((m) => m.id === prev.id) ?? null;
    });
  }, [messages]);

  const filteredMessages = messages.filter((msg) => {
    const q = searchTerm.trim();
    const matchesSearch =
      !q ||
      msg.name.includes(q) ||
      msg.email.toLowerCase().includes(q.toLowerCase()) ||
      msg.subject.includes(q) ||
      msg.message.includes(q);

    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' && !msg.isRead) ||
      (filter === 'starred' && msg.isStarred);

    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const patchMessage = async (id: number, body: { isRead?: boolean; isStarred?: boolean }) => {
    await fetch(`/api/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  };

  const markAsRead = (id: number) => {
    const current = messages.find((m) => m.id === id);
    if (!current || current.isRead) return;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    void patchMessage(id, { isRead: true });
  };

  const toggleStar = (id: number) => {
    const current = messages.find((m) => m.id === id);
    if (!current) return;
    const next = !current.isStarred;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isStarred: next } : m)));
    setSelectedMessage((prev) =>
      prev?.id === id ? { ...prev, isStarred: next } : prev,
    );
    void patchMessage(id, { isStarred: next });
  };

  const deleteMessage = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('delete failed');
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelectedMessage((prev) => (prev?.id === id ? null : prev));
    } catch {
      window.alert('تعذر حذف الرسالة');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const initialLetter = (name: string) => (name.trim()[0] ?? '?');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">الرسائل</h1>
          <p className="text-dark-400 mt-1">
            {loadError ? (
              <span className="text-red-400">{loadError}</span>
            ) : isLoading ? (
              'جاري التحميل...'
            ) : unreadCount > 0 ? (
              `${unreadCount} رسائل غير مقروءة`
            ) : (
              'لا توجد رسائل جديدة'
            )}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-4 space-y-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type="text"
                placeholder="البحث في الرسائل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading || !!loadError}
                className="w-full pl-4 pr-12 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-gold-500/50 disabled:opacity-50"
              />
            </div>

            <div className="flex gap-2">
              {(
                [
                  { id: 'all' as const, label: 'الكل' },
                  { id: 'unread' as const, label: 'غير مقروء' },
                  { id: 'starred' as const, label: 'مميز' },
                ]
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  disabled={isLoading || !!loadError}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    filter === f.id
                      ? 'bg-gold-500 text-dark-900'
                      : 'bg-dark-800 text-dark-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden">
            <div className="divide-y divide-dark-800 max-h-[600px] overflow-y-auto">
              {isLoading && (
                <div className="p-12 flex justify-center text-gold-500">
                  <Loader2 className="w-10 h-10 animate-spin" />
                </div>
              )}

              {!isLoading &&
                !loadError &&
                filteredMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setSelectedMessage(message);
                      markAsRead(message.id);
                    }}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedMessage?.id === message.id
                        ? 'bg-gold-500/10 border-r-2 border-gold-500'
                        : 'hover:bg-dark-800'
                    } ${!message.isRead ? 'bg-dark-800/50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-dark-900 font-bold text-sm">
                          {initialLetter(message.name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4
                            className={`font-medium truncate ${
                              !message.isRead ? 'text-white' : 'text-dark-300'
                            }`}
                          >
                            {message.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            {!message.isRead && (
                              <span className="w-2 h-2 rounded-full bg-gold-500" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStar(message.id);
                              }}
                              className="text-dark-500 hover:text-gold-400"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  message.isStarred ? 'text-gold-400 fill-current' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <p
                          className={`text-sm truncate ${
                            !message.isRead ? 'text-dark-300' : 'text-dark-500'
                          }`}
                        >
                          {message.subject}
                        </p>
                        <p className="text-xs text-dark-600 mt-1">
                          {formatDate(message.date)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

              {!isLoading && !loadError && filteredMessages.length === 0 && (
                <div className="p-8 text-center text-dark-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد رسائل</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden"
              >
                <div className="p-6 border-b border-dark-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                        <span className="text-dark-900 font-bold text-xl">
                          {initialLetter(selectedMessage.name)}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedMessage.name}</h2>
                        <p className="text-dark-400">{selectedMessage.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        type="button"
                        onClick={() => toggleStar(selectedMessage.id)}
                        className={`p-2 rounded-lg ${
                          selectedMessage.isStarred
                            ? 'bg-gold-500/20 text-gold-400'
                            : 'bg-dark-800 text-dark-400 hover:text-white'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            selectedMessage.isStarred ? 'fill-current' : ''
                          }`}
                        />
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => void deleteMessage(selectedMessage.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setSelectedMessage(null)}
                        className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-white lg:hidden"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-dark-400">
                      <Phone className="w-4 h-4 text-gold-400" />
                      <span>{selectedMessage.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark-400">
                      <Clock className="w-4 h-4 text-gold-400" />
                      <span>{formatDate(selectedMessage.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-b border-dark-800 bg-dark-800/30">
                  <h3 className="text-lg font-bold text-white">{selectedMessage.subject}</h3>
                </div>

                <div className="p-6">
                  <p className="text-dark-300 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="p-6 border-t border-dark-800 flex flex-wrap gap-3">
                  <motion.a
                    href={`mailto:${selectedMessage.email}`}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold rounded-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Reply className="w-5 h-5" />
                    <span>رد بالبريد</span>
                  </motion.a>
                  {digitsOnly(selectedMessage.phone).length >= 8 ? (
                    <>
                      <motion.a
                        href={`tel:${selectedMessage.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-2 px-5 py-3 bg-dark-800 text-white rounded-xl border border-dark-700"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Phone className="w-5 h-5" />
                        <span>اتصال</span>
                      </motion.a>
                      <motion.a
                        href={`https://wa.me/${digitsOnly(selectedMessage.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>واتساب</span>
                      </motion.a>
                    </>
                  ) : null}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-dark-900 rounded-2xl border border-dark-800 h-full min-h-[500px] flex items-center justify-center"
              >
                <div className="text-center text-dark-500">
                  <MailOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">اختر رسالة لعرضها</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
