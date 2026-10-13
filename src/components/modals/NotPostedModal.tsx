import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { REASON_OPTIONS } from '../../data/mockData';
import { X, AlertCircle } from 'lucide-react';

export const NotPostedModal: React.FC = () => {
  const { notPostedModal, closeNotPostedModal, markAsNotPosted } = useApp();
  const [selectedReason, setSelectedReason] = useState<string>('Approval Pending');
  const [comments, setComments] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!notPostedModal.isOpen || !notPostedModal.conversationId || !notPostedModal.messageId) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason.trim()) {
      setError('Please select a reason.');
      return;
    }

    markAsNotPosted(
      notPostedModal.conversationId!,
      notPostedModal.messageId!,
      selectedReason,
      comments.trim() || 'Waiting for client approval.'
    );

    setComments('');
    setError(null);
    closeNotPostedModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="fixed inset-0" onClick={closeNotPostedModal} />

      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
        {/* Mobile handle indicator */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Why wasn't this posted?
              </h2>
              <p className="text-xs text-slate-500">
                {notPostedModal.campaignName ? notPostedModal.campaignName : 'Select reason and provide comments'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeNotPostedModal}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="reason-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Reason <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="reason-select"
                value={selectedReason}
                onChange={(e) => {
                  setSelectedReason(e.target.value);
                  setError(null);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow appearance-none cursor-pointer"
              >
                {REASON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="comments-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Comments
            </label>
            <textarea
              id="comments-input"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add comments or explain why this was not posted..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
            />
          </div>

          {/* Quick Comment Presets */}
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Waiting for client approval.',
                'Asset dimensions incorrect.',
                'Hold until tomorrow morning.',
                'Duplicate creative submitted.'
              ].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setComments(sug)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors"
                >
                  "{sug}"
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeNotPostedModal}
              className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
