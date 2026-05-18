'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
}

const defaultColors: ThemeColors = {
  primary: '#d4af37',
  secondary: '#b8860b',
  background: '#0a0a0f',
  surface: '#12121a',
  text: '#ffffff',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setColors: (colors: ThemeColors) => void;
  updateColor: (key: keyof ThemeColors, value: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [colors, setColorsState] = useState<ThemeColors>(defaultColors);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setThemeState(savedTheme);
    }
    const savedColors = localStorage.getItem('themeColors');
    if (savedColors) {
      try {
        setColorsState(JSON.parse(savedColors));
      } catch (e) {
        console.error('Error parsing saved colors', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
    localStorage.setItem('themeColors', JSON.stringify(colors));
  }, [colors, mounted]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setColors = (newColors: ThemeColors) => {
    setColorsState(newColors);
  };

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setColorsState(prev => ({ ...prev, [key]: value }));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-950" />
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme, setColors, updateColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
