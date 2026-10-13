import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, ApprovalStatus } from '../../types';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
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
  AlertTriangle,
  FileText
} from 'lucide-react';

export const MarketerRequestsView: React.FC = () => {
  const { users, currentUser, approveMarketer, rejectMarketer, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ApprovalStatus>('all');
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
    <div className="flex-1 flex flex-col min-h-0 bg-[#f4f7fb] overflow-y-auto">
      <div className="max-w-3xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200">
                  Admin Control
                </span>
                {counts.pending > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                    {counts.pending} Action Required
                  </span>
                )}
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {t.requestsTitle}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {t.requestsSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Pending */}
          <div
            onClick={() => setStatusFilter('pending')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-amber-600 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {t.pendingRequests}
              </span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {counts.pending}
            </div>
          </div>

          {/* Approved */}
          <div
            onClick={() => setStatusFilter('approved')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'approved'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {t.approved}
              </span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {counts.approved}
            </div>
          </div>

          {/* Rejected */}
          <div
            onClick={() => setStatusFilter('rejected')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'rejected'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-rose-600 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {t.rejected}
              </span>
              <XCircle className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {counts.rejected}
            </div>
          </div>

          {/* Total Marketers */}
          <div
            onClick={() => setStatusFilter('all')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-blue-600 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {t.totalMarketers}
              </span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {counts.total}
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 space-y-2.5">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search marketer by name, email, @handle, city, or country..."
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

            {/* Filter Pills */}
            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-0.5">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => {
                const label =
                  st === 'all'
                    ? t.allFilter
                    : st === 'pending'
                    ? t.pendingRequests
                    : st === 'approved'
                    ? t.approved
                    : t.rejected;
                const count =
                  st === 'all'
                    ? counts.total
                    : st === 'pending'
                    ? counts.pending
                    : st === 'approved'
                    ? counts.approved
                    : counts.rejected;
                const isActive = statusFilter === st;

                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
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
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
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
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedMarketer(marketer)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={t.viewProfile}
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.viewProfile}</span>
                    </button>

                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenApproveConfirm(marketer)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.approve}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenRejectConfirm(marketer)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
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

      {/* ========================================================================= */}
      {/* VIEW PROFILE MODAL (All 13 required fields)                              */}
      {/* ========================================================================= */}
      {selectedMarketer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="fixed inset-0" onClick={() => setSelectedMarketer(null)} />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Marketer Registration Dossier
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMarketer(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: 13 Fields */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Profile Card Header */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <img
                  src={selectedMarketer.avatar}
                  alt={selectedMarketer.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">
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
                    <p className="text-blue-600 font-semibold mt-0.5">
                      {selectedMarketer.instagram}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    ID: {selectedMarketer.id}
                  </p>
                </div>
              </div>

              {/* 13 Structured Fields in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Name */}
                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Full Name
                  </span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {selectedMarketer.name}
                  </span>
                </div>

                {/* 2. Instagram */}
                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Instagram Handle
                  </span>
                  <span className="font-semibold text-blue-700 text-xs">
                    {selectedMarketer.instagram || 'Not provided'}
                  </span>
                </div>

                {/* 3. Email */}
                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Email Address
                  </span>
                  <span className="font-semibold text-slate-800 text-xs truncate block">
                    {selectedMarketer.email}
                  </span>
                </div>

                {/* 4. Phone */}
                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Phone (with Code)
                  </span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {selectedMarketer.phoneCountryCode
                      ? `${selectedMarketer.phoneCountryCode} ${selectedMarketer.phone}`
                      : selectedMarketer.phone}
                  </span>
                </div>

                {/* 5. Preferred Flyer Language */}
                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Preferred Flyer Language
                  </span>
                  <span className="font-semibold text-purple-700 text-xs uppercase">
                    {selectedMarketer.preferredFlyerLanguage === 'es'
                      ? 'Spanish (Español)'
                      : 'English'}
                  </span>
                </div>

                {/* 6. Preferred Flyer Categories */}
                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Flyer Categories
                  </span>
                  <div className="flex gap-1 flex-wrap mt-0.5">
                    {selectedMarketer.preferredFlyerCategories &&
                    selectedMarketer.preferredFlyerCategories.length > 0 ? (
                      selectedMarketer.preferredFlyerCategories.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold text-[10px]"
                        >
                          {c === 'work_injury' ? 'Work Injury' : 'Car Accident'}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">None selected</span>
                    )}
                  </div>
                </div>

                {/* 7. Country */}
                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Country
                  </span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {selectedMarketer.country || selectedMarketer.countryCode || 'Not specified'}
                  </span>
                </div>

                {/* 8. State */}
                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    State / Region
                  </span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {selectedMarketer.state || 'Not specified'}
                  </span>
                </div>

                {/* 9. City */}
                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    City
                  </span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {selectedMarketer.city || 'Not specified'}
                  </span>
                </div>

                {/* 10. Postal Code */}
                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Postal Code
                  </span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {selectedMarketer.postalCode || 'Not specified'}
                  </span>
                </div>

                {/* 11. Registration Date */}
                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Registration Date
                  </span>
                  <span className="font-semibold text-slate-700 text-xs">
                    {selectedMarketer.registeredAt
                      ? new Date(selectedMarketer.registeredAt).toLocaleString()
                      : 'Legacy / Prior registration'}
                  </span>
                </div>

                {/* 12. Approval Status */}
                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Approval Status
                  </span>
                  <span className="font-bold text-slate-800 text-xs uppercase">
                    {selectedMarketer.approvalStatus}
                  </span>
                </div>
              </div>

              {/* Review History Notes (if rejected or reviewed) */}
              {selectedMarketer.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  <span className="font-bold block mb-0.5">Rejection Reason:</span>
                  <p>{selectedMarketer.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMarketer(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedMarketer.approvalStatus !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleOpenApproveConfirm(selectedMarketer)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Marketer</span>
                  </button>
                )}

                {selectedMarketer.approvalStatus !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleOpenRejectConfirm(selectedMarketer)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Request</span>
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
