import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useShellLayout } from '../../context/ShellLayoutContext';
import { User, ApprovalStatus } from '../../types';
import { getFlyerCategoryLabel } from '../../utils/flyerCategories';
import {
  Users,
  Clock,
  Search,
  Eye,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Tag,
  Shield,
  Instagram,
  AlertTriangle
} from 'lucide-react';

export const MarketerRequestsView: React.FC = () => {
  const { users, approveMarketer, rejectMarketer, t, language } = useApp();
  const { isExpandedShell } = useShellLayout();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ApprovalStatus>('pending');
  const [selectedMarketer, setSelectedMarketer] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject';
    user: User;
  } | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Marketers only
  const allMarketers = useMemo(() => {
    return users.filter((u) => u.role === 'Marketer');
  }, [users]);

  // Counters
  const counts = useMemo(() => {
    const pending = allMarketers.filter((u) => u.approvalStatus === 'pending').length;
    const approved = allMarketers.filter((u) => u.approvalStatus === 'approved').length;
    const rejected = allMarketers.filter((u) => u.approvalStatus === 'rejected').length;
    return {
      pending,
      approved,
      rejected,
      total: allMarketers.length
    };
  }, [allMarketers]);

  // Filtered list
  const filteredMarketers = useMemo(() => {
    return allMarketers.filter((m) => {
      if (statusFilter !== 'all' && m.approvalStatus !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesInstagram = (m.instagram || '').toLowerCase().includes(q);
        const matchesCountry = (m.country || '').toLowerCase().includes(q);
        const matchesCity = (m.city || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesInstagram && !matchesCountry && !matchesCity) {
          return false;
        }
      }
      return true;
    });
  }, [allMarketers, statusFilter, searchQuery]);

  const handleOpenApproveConfirm = (u: User) => {
    setConfirmAction({ type: 'approve', user: u });
  };

  const handleOpenRejectConfirm = (u: User) => {
    setRejectionNotes('');
    setConfirmAction({ type: 'reject', user: u });
  };

  const handleExecuteAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'approve') {
      approveMarketer(confirmAction.user.id);
    } else {
      rejectMarketer(confirmAction.user.id, rejectionNotes.trim() || undefined);
    }
    // Update selected marketer if modal is open
    if (selectedMarketer?.id === confirmAction.user.id) {
      setSelectedMarketer((prev) =>
        prev
          ? {
              ...prev,
              approvalStatus: confirmAction.type === 'approve' ? 'approved' : 'rejected',
              rejectionReason: confirmAction.type === 'reject' ? rejectionNotes.trim() : undefined
            }
          : null
      );
    }
    setConfirmAction(null);
    setRejectionNotes('');
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 overflow-y-auto">
      <div
        className={`w-full mx-auto p-3 space-y-3 ${
          isExpandedShell ? 'max-w-3xl p-4 space-y-4' : 'max-w-md'
        }`}
      >
        {/* Search + status filters (single control — no duplicate counts) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 space-y-2.5">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, city..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                { key: 'pending' as const, label: 'Pending', count: counts.pending, active: 'bg-amber-500 text-white', idle: 'bg-amber-50 text-amber-800' },
                { key: 'approved' as const, label: 'Approved', count: counts.approved, active: 'bg-emerald-600 text-white', idle: 'bg-emerald-50 text-emerald-800' },
                { key: 'rejected' as const, label: 'Rejected', count: counts.rejected, active: 'bg-rose-600 text-white', idle: 'bg-rose-50 text-rose-800' },
                { key: 'all' as const, label: 'All', count: counts.total, active: 'bg-blue-600 text-white', idle: 'bg-slate-100 text-slate-700' }
              ] as const
            ).map((f) => {
              const isActive = statusFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    isActive ? f.active : f.idle
                  }`}
                >
                  <div className="text-base font-black leading-none">{f.count}</div>
                  <div className="text-[10px] font-bold mt-0.5 truncate">{f.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Request List */}
        <div className="space-y-2.5">
          {filteredMarketers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-8 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                {t.noRequestsFound}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Try selecting a different filter or clearing your search term.
              </p>
            </div>
          ) : (
            filteredMarketers.map((marketer) => {
              const isPending = marketer.approvalStatus === 'pending';
              const isApproved = marketer.approvalStatus === 'approved';
              const isRejected = marketer.approvalStatus === 'rejected';

              return (
                <div
                  key={marketer.id}
                  className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 hover:border-slate-300 transition-all gap-3 ${
                    isExpandedShell
                      ? 'flex flex-row items-center justify-between'
                      : 'flex flex-col items-stretch'
                  }`}
                >
                  {/* Marketer Brief */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <img
                      src={marketer.avatar}
                      alt={marketer.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                          {marketer.name}
                        </h3>
                        {/* Approval Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isApproved && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          {isPending && <Clock className="w-2.5 h-2.5 stroke-[3]" />}
                          {isRejected && <X className="w-2.5 h-2.5 stroke-[3]" />}
                          <span>{marketer.approvalStatus}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                        {marketer.instagram && (
                          <span className="text-blue-600 font-semibold truncate">
                            {marketer.instagram}
                          </span>
                        )}
                        <span className="truncate">{marketer.email}</span>
                        {marketer.country && (
                          <span className="text-slate-400">• {marketer.country}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        {marketer.preferredFlyerLanguage && (
                          <span>
                            Flyer Lang:{' '}
                            <strong className="text-slate-600 uppercase">
                              {marketer.preferredFlyerLanguage}
                            </strong>
                          </span>
                        )}
                        {marketer.registeredAt && (
                          <span>
                            • Registered:{' '}
                            {new Date(marketer.registeredAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div
                    className={`flex items-center gap-2 shrink-0 ${
                      isExpandedShell
                        ? 'w-auto justify-end'
                        : 'w-full justify-stretch pt-2 border-t border-slate-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedMarketer(marketer)}
                      className={`px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        !isExpandedShell ? 'flex-1' : ''
                      }`}
                      title={t.viewProfile}
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isExpandedShell ? t.viewProfile : 'View'}</span>
                    </button>

                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenApproveConfirm(marketer)}
                          className={`px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer ${
                            !isExpandedShell ? 'flex-1' : ''
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.approve}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenRejectConfirm(marketer)}
                          className={`px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            !isExpandedShell ? 'flex-1' : ''
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>{t.reject}</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <button
                        type="button"
                        onClick={() => handleOpenRejectConfirm(marketer)}
                        className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer"
                      >
                        {t.revokeApproval}
                      </button>
                    )}

                    {isRejected && (
                      <button
                        type="button"
                        onClick={() => handleOpenApproveConfirm(marketer)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.approve}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* View Profile Modal — Info + Address sections */}
      {selectedMarketer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="fixed inset-0" onClick={() => setSelectedMarketer(null)} />

          <div
            className={`relative w-full bg-white shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col ${
              isExpandedShell
                ? 'max-w-md rounded-3xl max-h-[90vh]'
                : 'max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92dvh]'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
              <h2 className="text-sm font-bold text-slate-900">{t.viewProfile}</h2>
              <button
                type="button"
                onClick={() => setSelectedMarketer(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              {/* Identity */}
              <div className="flex items-center gap-3">
                <img
                  src={selectedMarketer.avatar}
                  alt={selectedMarketer.name}
                  className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {selectedMarketer.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        selectedMarketer.approvalStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : selectedMarketer.approvalStatus === 'pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {selectedMarketer.approvalStatus}
                    </span>
                  </div>
                  {selectedMarketer.instagram && (
                    <p className="text-xs font-semibold text-blue-600 mt-0.5 flex items-center gap-1">
                      <Instagram className="w-3 h-3" />
                      {selectedMarketer.instagram}
                    </p>
                  )}
                </div>
              </div>

              {/* Info — icon + value rows */}
              <section className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Info
                  </span>
                </div>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {selectedMarketer.email}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-xs font-semibold text-slate-800">
                    {selectedMarketer.phoneCountryCode
                      ? `${selectedMarketer.phoneCountryCode} ${selectedMarketer.phone}`
                      : selectedMarketer.phone || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-xs font-semibold text-slate-800">
                    {selectedMarketer.preferredFlyerLanguage === 'es'
                      ? 'Spanish'
                      : 'English'}
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Tag className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {selectedMarketer.preferredFlyerCategories &&
                    selectedMarketer.preferredFlyerCategories.length > 0 ? (
                      selectedMarketer.preferredFlyerCategories.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-bold"
                        >
                          {getFlyerCategoryLabel(c, language)}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No category</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-xs font-semibold text-slate-800">
                    {selectedMarketer.registeredAt
                      ? new Date(selectedMarketer.registeredAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : '—'}
                  </p>
                </div>
              </section>

              {/* Address — compact icon rows */}
              <section className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Address
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-xs font-semibold text-slate-800">
                    {selectedMarketer.country ||
                      selectedMarketer.countryCode ||
                      'Not specified'}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-xs font-semibold text-slate-800">
                    {[selectedMarketer.city, selectedMarketer.state, selectedMarketer.postalCode]
                      .filter(Boolean)
                      .join(', ') || 'Not specified'}
                  </p>
                </div>
              </section>

              {selectedMarketer.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Rejection reason</span>
                    <p>{selectedMarketer.rejectionReason}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/80 shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMarketer(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                {selectedMarketer.approvalStatus !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleOpenApproveConfirm(selectedMarketer)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {t.approve}
                  </button>
                )}
                {selectedMarketer.approvalStatus !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleOpenRejectConfirm(selectedMarketer)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t.reject}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION DIALOG (Approve or Reject with Optional Reason)             */}
      {/* ========================================================================= */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmAction.type === 'approve'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {confirmAction.type === 'approve' ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {confirmAction.type === 'approve'
                    ? t.confirmApproveTitle
                    : t.confirmRejectTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {confirmAction.type === 'approve'
                    ? t.confirmApproveDesc(confirmAction.user.name)
                    : t.confirmRejectDesc(confirmAction.user.name)}
                </p>
              </div>
            </div>

            {/* If rejecting, allow internal reason notes */}
            {confirmAction.type === 'reject' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  rows={2}
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder={t.rejectionReasonPlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-rose-400 focus:ring-1 focus:ring-rose-100"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {t.cancel}
              </button>

              <button
                type="button"
                onClick={handleExecuteAction}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-2xs cursor-pointer ${
                  confirmAction.type === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {confirmAction.type === 'approve' ? t.approve : t.reject}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
