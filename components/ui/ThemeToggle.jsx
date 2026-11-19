'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current =
      document.documentElement.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(current);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('echoscout-theme', nextTheme);
    } catch (e) {}
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-[6px] border border-rule hover:border-ink-soft text-ink-soft hover:text-ink transition-colors cursor-pointer ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {mounted && theme === 'dark' ? (
        <Sun className="w-4 h-4" strokeWidth={1.5} />
      ) : (
        <Moon className="w-4 h-4" strokeWidth={1.5} />
      )}
    </button>
  );
}
