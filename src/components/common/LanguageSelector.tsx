import React from 'react';
import { useApp } from '../../context/AppContext';
import { AppLanguage } from '../../types';
import { Globe, Check } from 'lucide-react';

interface Props {
  className?: string;
  variant?: 'compact' | 'pill' | 'select';
}

export const LanguageSelector: React.FC<Props> = ({ className = '', variant = 'compact' }) => {
  const { language, setLanguage, t } = useApp();

  const handleSelect = (lang: AppLanguage) => {
    setLanguage(lang);
  };

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs ${className}`}>
        <button
          type="button"
          onClick={() => handleSelect('en')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
            language === 'en'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          title="English"
        >
          <span>🇺🇸</span>
          <span>EN</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelect('es')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
            language === 'es'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Español"
        >
          <span>🇪🇸</span>
          <span>ES</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-1 bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-xl border border-slate-200 shadow-3xs transition-all">
        <Globe className="w-3.5 h-3.5 text-blue-600" />
        <select
          value={language}
          onChange={(e) => handleSelect(e.target.value as AppLanguage)}
          className="bg-transparent border-none outline-none cursor-pointer pr-1 text-slate-800 font-bold text-xs"
          aria-label={t.appLanguage}
        >
          <option value="en">🇺🇸 English</option>
          <option value="es">🇪🇸 Español</option>
        </select>
      </div>
    </div>
  );
};
