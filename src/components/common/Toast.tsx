import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm pointer-events-none transition-all duration-200">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
        toast.type === 'success'
          ? 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-emerald-900/5'
          : toast.type === 'error'
          ? 'bg-rose-50 text-rose-900 border-rose-200 shadow-rose-900/5'
          : 'bg-slate-900 text-white border-slate-800 shadow-slate-900/10'
      }`}>
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
        <span className="flex-1 truncate">{toast.message}</span>
      </div>
    </div>
  );
};
