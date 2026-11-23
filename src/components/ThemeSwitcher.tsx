import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Sparkles, ChevronDown } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: Array<{ id: Theme; label: string; icon: React.ReactNode; color: string }> = [
    {
      id: 'dark',
      label: 'Cyber-Lab (Dark)',
      icon: <Moon className="w-3.5 h-3.5 text-cyan-400" />,
      color: 'bg-cyan-950 text-cyan-300'
    },
    {
      id: 'light',
      label: 'Campus Pro (Light)',
      icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
      color: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'midnight',
      label: 'Midnight (Neon Violet)',
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
      color: 'bg-purple-950 text-purple-300'
    }
  ];

  const currentOption = options.find((o) => o.id === theme) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/10 dark:border-white/10 hover:border-cyan-500/40 transition-all bg-slate-900/80 dark:bg-slate-900/80 light:bg-white text-slate-200 light:text-slate-800 shadow-xs active:scale-95"
        title="Switch UI Theme"
        aria-label="Switch UI Theme"
      >
        {currentOption.icon}
        <span className="hidden sm:inline text-[11px]">{currentOption.label.split(' ')[0]}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl p-1.5 shadow-2xl border border-white/15 dark:border-white/15 bg-[#0F172A] text-white z-50 animate-in fade-in zoom-in-95">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1 mb-1">
            Choose Theme
          </div>
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setTheme(opt.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                theme === opt.id
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {opt.icon}
              <span className="flex-1">{opt.label}</span>
              {theme === opt.id && <span className="text-cyan-300 text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
