'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  Image,
  Mail,
  Eye,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Loader2,
} from 'lucide-react';

type DashboardPayload = {
  stats: {
    projectsCount: number;
    galleryCount: number;
    messagesCount: number;
    unreadMessages: number;
    messagesToday: number;
    galleryGrowthPct: number;
  };
  recentMessages: Array<{
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
  }>;
  topProjects: Array<{
    id: number;
    titleAr: string;
    titleEn: string;
    status: string;
    viewCount: number;
  }>;
};

export default function AdminDashboard() {
  const language = 'ar' as const;
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/dashboard', { credentials: 'include' });
        if (!res.ok) throw new Error('fail');
        const json = (await res.json()) as DashboardPayload;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError('تعذر تحميل لوحة التحكم');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data && !error) {
    return (
      <div className="flex justify-center py-24 text-gold-500">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-400 text-center">
        {error || 'خطأ غير متوقع'}
      </div>
    );
  }

  const { stats, recentMessages, topProjects } = data;

  const statsCards = [
    {
      title: { ar: 'إجمالي المشاريع', en: 'Total Projects' },
      value: String(stats.projectsCount),
      change: '+—',
      isPositive: true,
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: { ar: 'صور المعرض', en: 'Gallery Images' },
      value: String(stats.galleryCount),
      change: `${stats.galleryGrowthPct}%`,
      isPositive: true,
      icon: Image,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: { ar: 'الرسائل الجديدة', en: 'New Messages' },
      value: String(stats.unreadMessages),
      change: `${stats.messagesToday} اليوم`,
      isPositive: true,
      icon: Mail,
      color: 'from-green-500 to-green-600',
    },
    {
      title: { ar: 'إجمالي الرسائل', en: 'All Messages' },
      value: String(stats.messagesCount),
      change: '+—',
      isPositive: true,
      icon: Eye,
      color: 'from-gold-500 to-gold-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title.ar}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-900 rounded-2xl p-6 border border-dark-800"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  stat.isPositive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {stat.isPositive ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-dark-400 text-sm">{stat.title[language]}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-dark-900 rounded-2xl p-6 border border-dark-800"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">
              {language === 'ar' ? 'نشاط الموقع' : 'Site Activity'}
            </h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[65, 45, 75, 50, 85, 60, 90].map((height, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="flex-1 bg-gradient-to-t from-gold-600 to-gold-400 rounded-t-lg relative group cursor-pointer"
              />
            ))}
          </div>
          <p className="text-dark-500 text-sm mt-4 px-4">
            {language === 'ar'
              ? 'ملخص تشغيلي — الأرقام أعلاه من قاعدة البيانات.'
              : 'Operational summary — figures above are live from the database.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-dark-900 rounded-2xl p-6 border border-dark-800"
        >
          <h3 className="text-lg font-bold text-white mb-6">
            {language === 'ar' ? 'إحصائيات سريعة' : 'Quick Stats'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-dark-400 text-sm">
                  {language === 'ar' ? 'رسائل اليوم' : 'Messages today'}
                </p>
                <p className="text-white font-bold">{stats.messagesToday}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-dark-400 text-sm">
                  {language === 'ar' ? 'غير مقروء' : 'Unread'}
                </p>
                <p className="text-white font-bold">{stats.unreadMessages}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Activity className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-dark-400 text-sm">
                  {language === 'ar' ? 'المعرض' : 'Gallery'}
                </p>
                <p className="text-white font-bold">{stats.galleryCount}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-dark-900 rounded-2xl p-6 border border-dark-800"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">
              {language === 'ar' ? 'آخر الرسائل' : 'Recent Messages'}
            </h3>
            <Link href="/admin/messages" className="text-gold-400 text-sm font-medium hover:text-gold-300">
              {language === 'ar' ? 'عرض الكل' : 'View All'}
            </Link>
          </div>
          <div className="space-y-4">
            {recentMessages.length === 0 ? (
              <p className="text-dark-500 text-sm">لا توجد رسائل بعد</p>
            ) : (
              recentMessages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-dark-900 font-bold text-sm">{msg.name[0] ?? '؟'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <h4 className="text-white font-medium truncate">{msg.name}</h4>
                      <span className="text-dark-500 text-xs whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleString('ar-SA')}
                      </span>
                    </div>
                    <p className="text-dark-400 text-sm truncate">{msg.subject || msg.message}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-dark-900 rounded-2xl p-6 border border-dark-800"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">
              {language === 'ar' ? 'أكثر المشاريع مشاهدة' : 'Top Projects'}
            </h3>
            <Link href="/admin/projects" className="text-gold-400 text-sm font-medium hover:text-gold-300">
              {language === 'ar' ? 'عرض الكل' : 'View All'}
            </Link>
          </div>
          <div className="space-y-4">
            {topProjects.length === 0 ? (
              <p className="text-dark-500 text-sm">لا توجد مشاريع بعد</p>
            ) : (
              topProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors cursor-pointer"
                  onClick={() => window.open(`/projects/${project.id}`, '_blank')}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gold-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{project.titleAr}</h4>
                    <span className="text-xs text-dark-400 truncate block">{project.status}</span>
                  </div>
                  <div className="text-end">
                    <p className="text-white font-bold">{project.viewCount.toLocaleString('ar-SA')}</p>
                    <p className="text-dark-500 text-xs">
                      {language === 'ar' ? 'مشاهدة' : 'views'}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
