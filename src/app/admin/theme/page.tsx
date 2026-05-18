'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Palette, Sun, Moon, Eye, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const colorPresets = [
  { name: 'ذهبي كلاسيكي', primary: '#d4af37', secondary: '#b8860b' },
  { name: 'أزرق ملكي', primary: '#1e40af', secondary: '#1e3a8a' },
  { name: 'أخضر زمردي', primary: '#059669', secondary: '#047857' },
  { name: 'بنفسجي فاخر', primary: '#7c3aed', secondary: '#6d28d9' },
  { name: 'أحمر أنيق', primary: '#dc2626', secondary: '#b91c1c' },
];

export default function AdminTheme() {
  const { theme, setTheme, colors: globalColors, setColors: setGlobalColors } = useTheme();
  const [colors, setColors] = useState(globalColors);
  const [defaultTheme, setDefaultTheme] = useState<'dark' | 'light'>(theme);
  const [enableThemeToggle, setEnableThemeToggle] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setColors(globalColors);
    setDefaultTheme(theme);
  }, [globalColors, theme]);

  const handleSave = () => {
    setGlobalColors(colors);
    setTheme(defaultTheme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    const newColors = {
      ...colors,
      primary: preset.primary,
      secondary: preset.secondary,
    };
    setColors(newColors);
    setGlobalColors(newColors);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">الثيم والألوان</h1>
          <p className="text-dark-400 mt-1">تخصيص مظهر الموقع</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            className="flex items-center gap-2 px-5 py-3 bg-dark-800 text-white rounded-xl border border-dark-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="w-5 h-5" />
            <span>معاينة</span>
          </motion.button>
          <motion.button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-3 font-bold rounded-xl ${
              saved 
                ? 'bg-green-500 text-white' 
                : 'bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            <span>{saved ? 'تم الحفظ!' : 'حفظ التغييرات'}</span>
          </motion.button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Color Settings */}
        <div className="space-y-6">
          {/* Color Presets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-900 rounded-2xl border border-dark-800 p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-gold-400" />
              قوالب الألوان الجاهزة
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {colorPresets.map((preset, index) => (
                <motion.button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className={`p-4 rounded-xl border transition-all ${
                    colors.primary === preset.primary
                      ? 'border-gold-500 bg-dark-800'
                      : 'border-dark-700 hover:border-dark-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <p className="text-white text-sm font-medium">{preset.name}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Custom Colors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-900 rounded-2xl border border-dark-800 p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">ألوان مخصصة</h2>
            <div className="space-y-4">
              {[
                { key: 'primary', label: 'اللون الرئيسي' },
                { key: 'secondary', label: 'اللون الثانوي' },
                { key: 'background', label: 'لون الخلفية' },
                { key: 'surface', label: 'لون السطح' },
                { key: 'text', label: 'لون النص' },
              ].map((color) => (
                <div key={color.key} className="flex items-center gap-4">
                  <label className="flex-1 text-dark-300">{color.label}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={colors[color.key as keyof typeof colors]}
                      onChange={(e) => setColors(prev => ({ ...prev, [color.key]: e.target.value }))}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={colors[color.key as keyof typeof colors]}
                      onChange={(e) => setColors(prev => ({ ...prev, [color.key]: e.target.value }))}
                      className="w-28 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Theme Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-900 rounded-2xl border border-dark-800 p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">إعدادات الوضع</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-3">
                  الوضع الافتراضي
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDefaultTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-colors ${
                      defaultTheme === 'dark'
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    <Moon className={`w-5 h-5 ${defaultTheme === 'dark' ? 'text-gold-400' : 'text-dark-400'}`} />
                    <span className={defaultTheme === 'dark' ? 'text-white' : 'text-dark-400'}>
                      داكن
                    </span>
                  </button>
                  <button
                    onClick={() => setDefaultTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-colors ${
                      defaultTheme === 'light'
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    <Sun className={`w-5 h-5 ${defaultTheme === 'light' ? 'text-gold-400' : 'text-dark-400'}`} />
                    <span className={defaultTheme === 'light' ? 'text-white' : 'text-dark-400'}>
                      فاتح
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl">
                <div>
                  <h4 className="text-white font-medium">السماح بتغيير الوضع</h4>
                  <p className="text-dark-500 text-sm">السماح للزوار بالتبديل بين الوضع الفاتح والداكن</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableThemeToggle}
                    onChange={(e) => setEnableThemeToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                </label>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-900 rounded-2xl border border-dark-800 p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">معاينة</h2>
          
          {/* Mini Preview */}
          <div 
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: colors.background }}
          >
            {/* Header Preview */}
            <div 
              className="p-4 flex items-center justify-between"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <span style={{ color: colors.background }} className="font-bold text-sm">ص</span>
                </div>
                <span style={{ color: colors.text }} className="font-bold text-sm">صقر الجزيرة</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className="w-12 h-2 rounded"
                    style={{ backgroundColor: `${colors.text}20` }}
                  />
                ))}
              </div>
            </div>

            {/* Hero Preview */}
            <div className="p-8 text-center">
              <div 
                className="text-xs font-medium mb-2 inline-block px-3 py-1 rounded-full"
                style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
              >
                نبني المستقبل
              </div>
              <h3 
                className="text-lg font-bold mb-2"
                style={{ color: colors.text }}
              >
                صقر الجزيرة للتطوير العقاري
              </h3>
              <p 
                className="text-xs mb-4 opacity-60"
                style={{ color: colors.text }}
              >
                نقدم لكم أفضل المشاريع العقارية
              </p>
              <button
                className="px-4 py-2 rounded-lg text-xs font-bold"
                style={{ 
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                  color: colors.background
                }}
              >
                استكشف مشاريعنا
              </button>
            </div>

            {/* Cards Preview */}
            <div className="p-4 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video rounded-lg"
                  style={{ backgroundColor: colors.surface }}
                />
              ))}
            </div>
          </div>

          {/* Color Info */}
          <div className="mt-6 grid grid-cols-5 gap-2">
            {Object.entries(colors).map(([key, value]) => (
              <div key={key} className="text-center">
                <div
                  className="w-full h-10 rounded-lg mb-2"
                  style={{ backgroundColor: value }}
                />
                <p className="text-dark-500 text-xs">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
