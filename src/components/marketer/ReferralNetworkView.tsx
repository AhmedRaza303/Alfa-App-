import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useShellLayout } from '../../context/ShellLayoutContext';
import {
  getReferralDownline,
  getReferralNetworkSummary
} from '../../utils/referrals';
import { ApprovalStatus, ReferralRelationType } from '../../types';
import {
  Link2,
  Copy,
  Check,
  Users,
  Share2,
  Network,
  GitBranch,
  Search,
  Hash,
  Globe2
} from 'lucide-react';

type RelationFilter = 'all' | ReferralRelationType;

function statusMeta(status: ApprovalStatus | undefined) {
  if (status === 'pending') {
    return { label: 'Pending', className: 'bg-amber-50 text-amber-800 border-amber-200' };
  }
  if (status === 'rejected') {
    return { label: 'Rejected', className: 'bg-rose-50 text-rose-700 border-rose-200' };
  }
  return { label: 'Approved', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
}

function formatOnboarded(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export const ReferralNetworkView: React.FC = () => {
  const { currentUser, users, getReferralLinkForUser, showToast, setActiveTab } = useApp();
  const { isExpandedShell } = useShellLayout();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [relationFilter, setRelationFilter] = useState<RelationFilter>('all');
  const [search, setSearch] = useState('');

  const link = getReferralLinkForUser() || '';
  const code = currentUser?.referralCode || '';

  const summary = useMemo(() => {
    if (!currentUser) {
      return { directCount: 0, indirectCount: 0, totalNetwork: 0, totalReferralPoints: 0 };
    }
    return getReferralNetworkSummary(users, currentUser.id);
  }, [users, currentUser]);

  const downline = useMemo(() => {
    if (!currentUser) return [];
    return getReferralDownline(users, currentUser.id);
  }, [users, currentUser]);

  const filtered = useMemo(() => {
    let list = downline;
    if (relationFilter !== 'all') {
      list = list.filter((d) => d.relation === relationFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.user.name.toLowerCase().includes(q) ||
          (d.user.country || '').toLowerCase().includes(q) ||
          (d.user.referralCode || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [downline, relationFilter, search]);

  if (currentUser?.role !== 'Marketer') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-50">
        <Users className="w-10 h-10 text-slate-300 mb-3" />
        <p className="text-sm font-bold text-slate-800">Marketer referrals only</p>
        <button
          type="button"
          onClick={() => setActiveTab('conversations')}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
        >
          Back
        </button>
      </div>
    );
  }

  const copyText = async (value: string, kind: 'link' | 'code') => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      if (kind === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        showToast('Referral link copied', 'success');
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        showToast('Referral code copied', 'success');
      }
    } catch {
      showToast('Could not copy — select the text manually', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (!link) return;
    const payload = {
      title: 'Join MarketPulse',
      text: `Join with my referral code ${code}`,
      url: link
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // fall through to copy
      }
    }
    await copyText(link, 'link');
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 overflow-y-auto">
      <div
        className={`w-full mx-auto p-3 space-y-3 pb-6 ${
          isExpandedShell ? 'max-w-3xl p-4 space-y-4' : 'max-w-md'
        }`}
      >
        {/* 1. Referral link & code */}
        <section
          className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3"
          data-tour="referral-invite"
        >
          <div className="flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Invite marketers
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Share your link or code. New marketers who register with either are linked to your
            network automatically.
          </p>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Referral link
            </p>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2">
              <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <p className="text-[11px] font-semibold text-slate-700 truncate flex-1 min-w-0">
                {link || '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={!link}
              className="mt-1.5 w-full py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer disabled:opacity-50"
            >
              {copiedLink ? 'Link copied' : 'Share link'}
            </button>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Referral code
            </p>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 min-w-0 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2">
                <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <p className="text-sm font-extrabold tracking-widest text-slate-900 truncate">
                  {code || '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyText(code, 'code')}
                disabled={!code}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400 font-medium">
              Others can enter this code on signup if they don&apos;t open your link.
            </p>
          </div>
        </section>

        {/* 2. Network overview */}
        <section className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-3 shadow-2xs">
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-sky-700/80 mb-1">
              <Users className="w-3 h-3" /> Direct
            </div>
            <p className="text-xl font-extrabold text-sky-950 leading-none tabular-nums">
              {summary.directCount}
            </p>
            <p className="text-[9px] font-semibold text-sky-800/70 mt-1">You onboarded</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-3 shadow-2xs">
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-800/80 mb-1">
              <GitBranch className="w-3 h-3" /> Indirect
            </div>
            <p className="text-xl font-extrabold text-amber-950 leading-none tabular-nums">
              {summary.indirectCount}
            </p>
            <p className="text-[9px] font-semibold text-amber-800/70 mt-1">Downline</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <Network className="w-3 h-3" /> Total
            </div>
            <p className="text-xl font-extrabold text-slate-900 leading-none tabular-nums">
              {summary.totalNetwork}
            </p>
            <p className="text-[9px] font-semibold text-slate-500 mt-1">Full network</p>
          </div>
        </section>

        {/* 3–4. Downline + filters */}
        <section
          className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3"
          data-tour="referral-downline"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Downline details
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 tabular-nums">
              {filtered.length} shown
            </span>
          </div>

          <div className="flex gap-1.5">
            {(
              [
                { id: 'all' as const, label: 'All' },
                { id: 'direct' as const, label: 'Direct' },
                { id: 'indirect' as const, label: 'Indirect' }
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setRelationFilter(f.id)}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer transition-colors ${
                  relationFilter === f.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name…"
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-400"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center px-3">
              <Network className="w-7 h-7 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No referrals here</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] mx-auto">
                {downline.length === 0
                  ? 'Share your link or code to grow your network.'
                  : 'Try another filter or search.'}
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((entry) => {
                const st = statusMeta(entry.user.approvalStatus);
                return (
                  <li
                    key={entry.user.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <img
                        src={entry.user.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-white shadow-2xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                              <p className="text-xs font-extrabold text-slate-900 truncate">
                                {entry.user.name}
                              </p>
                              <span
                                className={`shrink-0 inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${
                                  entry.relation === 'direct'
                                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                {entry.relation === 'direct'
                                  ? 'Direct'
                                  : `Indirect · L${entry.depth}`}
                              </span>
                            </div>
                            <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <Globe2 className="w-3 h-3 shrink-0" />
                              {entry.user.country || '—'}
                            </p>
                            {entry.relation === 'indirect' && (
                              <p className="mt-1 text-[10px] text-slate-400 font-medium truncate">
                                Via {entry.referredByName}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <span
                              className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${st.className}`}
                            >
                              {st.label}
                            </span>
                            <p className="mt-1 text-[10px] font-semibold text-slate-400">
                              {formatOnboarded(entry.user.registeredAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 5. Future incentives note (structure ready; no rewards UI yet) */}
        <p className="text-[10px] text-slate-400 text-center px-2 leading-relaxed">
          Network tracking is live. Referral rewards / bonus points can plug into this structure
          later without changing how links and downlines work.
        </p>
      </div>
    </div>
  );
};
