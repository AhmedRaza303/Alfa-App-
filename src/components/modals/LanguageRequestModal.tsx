import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CONTENT_LANGUAGE_OPTIONS } from '../../data/mockData';
import { RequestableContentLanguage } from '../../types';
import { X, Languages, AlertCircle } from 'lucide-react';

export const LanguageRequestModal: React.FC = () => {
  const { languageRequestModal, closeLanguageRequestModal, submitLanguageRequest } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sourceLanguage: RequestableContentLanguage =
    languageRequestModal.contentLanguage || 'en';

  const targetLanguage = useMemo(
    (): RequestableContentLanguage => (sourceLanguage === 'en' ? 'es' : 'en'),
    [sourceLanguage]
  );

  const sourceLabel =
    CONTENT_LANGUAGE_OPTIONS.find((o) => o.id === sourceLanguage)?.label ||
    (sourceLanguage === 'es' ? 'Spanish (Español)' : 'English');

  const targetLabel =
    CONTENT_LANGUAGE_OPTIONS.find((o) => o.id === targetLanguage)?.label ||
    (targetLanguage === 'es' ? 'Spanish (Español)' : 'English');

  if (
    !languageRequestModal.isOpen ||
    !languageRequestModal.conversationId ||
    !languageRequestModal.messageId
  ) {
    return null;
  }

  const handleConfirm = () => {
    setError(null);
    setSubmitting(true);
    const result = submitLanguageRequest({
      conversationId: languageRequestModal.conversationId!,
      messageId: languageRequestModal.messageId!,
      campaignName: languageRequestModal.campaignName,
      sourceLanguage,
      requestedLanguage: targetLanguage,
      requestedLanguageLabel: targetLabel
    });
    setSubmitting(false);
    if (result.success) closeLanguageRequestModal();
    else if (result.message) setError(result.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={closeLanguageRequestModal} />

      <div className="relative w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden">
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
              <Languages className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900">Need Another Language</h2>
              <p className="text-xs text-slate-500 truncate">
                {languageRequestModal.campaignName || 'Confirm language request'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeLanguageRequestModal}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-sm text-slate-600 leading-relaxed text-center">
            This message is in <span className="font-bold text-slate-900">{sourceLabel}</span>.
            <br />
            Request it in{' '}
            <span className="font-bold text-indigo-700">{targetLabel}</span>?
          </p>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeLanguageRequestModal}
              className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="min-h-[44px] px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl shadow-sm cursor-pointer"
            >
              Confirm request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
