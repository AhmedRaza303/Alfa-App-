import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useShellLayout } from '../../context/ShellLayoutContext';
import {
  buildReferralTree,
  getDirectReferrals,
  ReferralNode
} from '../../utils/referrals';
import { ApprovalStatus } from '../../types';
import {
  Link2,
  Copy,
  Check,
  Users,
  GitBranch,
  ChevronDown,
  Share2,
  Crown,
  Network
} from 'lucide-react';

function statusStyles(status: ApprovalStatus | undefined) {
  if (status === 'pending') {
    return {
      ring: 'ring-amber-300',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      line: 'bg-amber-300'
    };
  }
  if (status === 'rejected') {
    return {
      ring: 'ring-rose-300',
      badge: 'bg-rose-100 text-rose-700 border-rose-200',
      line: 'bg-rose-300'
    };
  }
  return {
    ring: 'ring-emerald-300',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    line: 'bg-emerald-300'
  };
}

export const ReferralNetworkView: React.FC = () => {
  const { currentUser, users, getReferralLinkForUser, showToast, setActiveTab } = useApp();
  const { isExpandedShell } = useShellLayout();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const link = getReferralLinkForUser() || '';
  const code = currentUser?.referralCode || '';

  const tree = useMemo(() => {
    if (!currentUser) return null;
    return buildReferralTree(users, currentUser.id);
  }, [users, currentUser]);

  const direct = useMemo(() => {
    if (!currentUser) return [];
    return getDirectReferrals(users, currentUser.id);
  }, [users, currentUser]);

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

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      showToast('Referral link copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy — select the link manually', 'error');
    }
  };

  const isExpanded = (id: string, depth: number) =>
    expanded[id] !== undefined ? expanded[id] : depth < 2;

  const toggle = (id: string, depth: number) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !(prev[id] !== undefined ? prev[id] : depth < 2)
    }));
  };

  const renderBranch = (node: ReferralNode, depth: number, isLast: boolean) => {
    const hasKids = node.children.length > 0;
    const open = isExpanded(node.user.id, depth);
    const status = node.user.approvalStatus || 'approved';
    const styles = statusStyles(status);
    const isRoot = depth === 0;

    return (
      <div key={node.user.id} className="relative">
        {/* Vertical connector from parent */}
        {depth > 0 && (
          <>
            <span
              className={`absolute left-[19px] -top-3 w-0.5 h-3 ${styles.line}`}
              aria-hidden
            />
            <span
              className={`absolute left-[19px] top-5 w-3 h-0.5 ${styles.line}`}
              aria-hidden
            />
            {!isLast && (
              <span
                className="absolute left-[19px] top-5 bottom-0 w-0.5 bg-slate-200"
                aria-hidden
              />
            )}
          </>
        )}

        <div className={depth > 0 ? 'pl-8' : ''}>
          <div
            className={`relative flex items-center gap-2.5 rounded-2xl border p-2.5 transition-shadow ${
              isRoot
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
                : 'bg-white border-slate-200/90 shadow-2xs hover:shadow-xs'
            }`}
          >
            {hasKids && !isRoot && (
              <button
                type="button"
                onClick={() => toggle(node.user.id, depth)}
                className="absolute -left-1 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer z-10 shadow-2xs"
                aria-label={open ? 'Collapse' : 'Expand'}
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${open ? '' : '-rotate-90'}`}
                />
              </button>
            )}

            <div className="relative shrink-0">
              <img
                src={node.user.avatar}
                alt=""
                className={`w-10 h-10 rounded-full object-cover ring-2 ${
                  isRoot ? 'ring-white/80' : styles.ring
                }`}
                referrerPolicy="no-referrer"
              />
              {isRoot && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center border-2 border-white">
                  <Crown className="w-2.5 h-2.5" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p
                  className={`text-xs font-extrabold truncate ${
                    isRoot ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {node.user.name}
                </p>
                {isRoot && (
                  <span className="text-[9px] font-bold uppercase tracking-wide bg-white/20 text-white px-1.5 py-0.5 rounded-md">
                    You
                  </span>
                )}
                {!isRoot && (
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
                    L{depth}
                  </span>
                )}
              </div>
              <p
                className={`text-[10px] font-semibold truncate mt-0.5 ${
                  isRoot ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {node.user.referralCode}
                {node.user.city ? ` · ${node.user.city}` : ''}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              {!isRoot && (
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border ${styles.badge}`}
                >
                  {status}
                </span>
              )}
              {(node.directCount > 0 || isRoot) && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                    isRoot ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  {node.directCount}
                  {node.totalCount > node.directCount && (
                    <span className="opacity-70">· {node.totalCount} total</span>
                  )}
                </span>
              )}
            </div>

            {hasKids && isRoot && (
              <button
                type="button"
                onClick={() => toggle(node.user.id, depth)}
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer shrink-0"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${open ? '' : '-rotate-90'}`}
                />
              </button>
            )}
          </div>

          {hasKids && open && (
            <div className="relative mt-3 space-y-3">
              {/* Stem under root */}
              {isRoot && (
                <span
                  className="absolute left-[19px] -top-3 w-0.5 h-3 bg-blue-400"
                  aria-hidden
                />
              )}
              {node.children.map((child, idx) =>
                renderBranch(child, depth + 1, idx === node.children.length - 1)
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 overflow-y-auto">
      <div
        className={`w-full mx-auto p-3 space-y-3 pb-6 ${
          isExpandedShell ? 'max-w-3xl p-4 space-y-4' : 'max-w-md'
        }`}
      >
        {/* Share link */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Your referral link
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Share this link. New marketers who sign up through it join your network.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 min-w-0 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2">
              <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <p className="text-[11px] font-semibold text-slate-700 truncate">{link}</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[10px] font-semibold text-slate-400">
            Code: <span className="text-slate-700 font-extrabold tracking-wide">{code}</span>
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <Users className="w-3 h-3" /> Direct
            </div>
            <p className="text-xl font-extrabold text-slate-900 leading-none">
              {tree?.directCount ?? direct.length}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">signed up with your link</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <Network className="w-3 h-3" /> Network
            </div>
            <p className="text-xl font-extrabold text-slate-900 leading-none">
              {tree?.totalCount ?? 0}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">total in your tree</p>
          </div>
        </section>

        {/* New tree */}
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Referral tree
              </span>
            </div>
            {tree && tree.totalCount > 0 && (
              <span className="text-[10px] font-bold text-slate-400">
                {tree.totalCount} marketer{tree.totalCount === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <div className="p-3.5">
            {!tree || tree.totalCount === 0 ? (
              <div className="py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center mx-auto mb-3">
                  <Network className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-xs font-bold text-slate-700">No referrals yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                  Copy your link and share it. When someone signs up, your tree grows here.
                </p>
              </div>
            ) : (
              <div className="space-y-1">{renderBranch(tree, 0, true)}</div>
            )}
          </div>

          {tree && tree.totalCount > 0 && (
            <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50/80 flex flex-wrap gap-3 text-[10px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Approved
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Rejected
              </span>
              <span className="inline-flex items-center gap-1 ml-auto text-slate-400">
                L1 = direct · L2+ = downline
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
