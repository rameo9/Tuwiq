'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(
          data.error === 'Invalid credentials'
            ? 'اسم المستخدم أو كلمة المرور غير صحيحة'
            : typeof data.error === 'string'
              ? data.error
              : 'فشل تسجيل الدخول',
        );
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-dark-900 font-bold text-3xl">ص</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-white">صقر الجزيرة</h1>
          <p className="text-dark-400 mt-2">تسجيل الدخول إلى لوحة التحكم</p>
        </div>

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          autoComplete="on"
          className="bg-dark-900 rounded-2xl border border-dark-800 p-8 space-y-6"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Username */}
          <div>
            <label className="block text-dark-300 text-sm font-medium mb-2">
              اسم المستخدم
            </label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full pl-4 pr-12 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-gold-500/50 transition-colors"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-dark-300 text-sm font-medium mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-12 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-gold-500/50 transition-colors"
                placeholder="أدخل كلمة المرور"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-gold-500 focus:ring-gold-500/50"
              />
              <span className="text-dark-400 text-sm">تذكرني</span>
            </label>
            <button type="button" className="text-gold-400 text-sm hover:text-gold-300">
              نسيت كلمة المرور؟
            </button>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              <span>تسجيل الدخول</span>
            )}
          </motion.button>

        </motion.form>

        {/* Back to Site */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <a href="/" className="text-dark-400 hover:text-gold-400 text-sm">
            العودة للموقع الرئيسي
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
