import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Props {
  textToCopy: string;
  className?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  label?: string;
}

export const CopyButton: React.FC<Props> = ({
  textToCopy,
  className = '',
  tooltipPosition = 'top',
  label
}) => {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!textToCopy) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for non-secure / iframe contexts
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy text', err);
    }
  };

  return (
    <div className="relative inline-flex items-center shrink-0">
      <button
        type="button"
        onClick={handleCopy}
        className={`p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 group/copy ${className}`}
        title={t.copy}
        aria-label={label || t.copy}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        ) : (
          <Copy className="w-3.5 h-3.5 shrink-0 group-hover/copy:scale-110 transition-transform" />
        )}
        {label && <span className="text-[11px] font-medium">{label}</span>}
      </button>

      {/* Floating Copied Badge */}
      {copied && (
        <span
          className={`absolute ${
            tooltipPosition === 'top'
              ? 'bottom-full mb-1 left-1/2 -translate-x-1/2'
              : 'top-full mt-1 left-1/2 -translate-x-1/2'
          } z-50 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded-md shadow-md whitespace-nowrap animate-in fade-in-50 zoom-in-95 pointer-events-none`}
        >
          {t.copied}
        </span>
      )}
    </div>
  );
};
