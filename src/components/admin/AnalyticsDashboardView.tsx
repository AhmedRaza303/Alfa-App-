import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useShellLayout } from '../../context/ShellLayoutContext';
import { ContentCategory, PostingStatus } from '../../types';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Layers,
  UserCheck,
  MessageSquare,
  TrendingUp,
  Percent,
  SendHorizontal,
  UserPlus
} from 'lucide-react';

type ReasonCount = { reason: string; count: number };
type MarketerStat = {
  id: string;
  name: string;
  avatar: string;
  total: number;
  posted: number;
  notPosted: number;
  pending: number;
  rate: number;
};

const CATEGORY_META: Record<
  ContentCategory,
  { label: string; Icon: React.ElementType; bar: string; chip: string }
> = {
  flyer: {
    label: 'Flyer',
    Icon: Layers,
    bar: 'bg-blue-600',
    chip: 'bg-blue-50 text-blue-700 border-blue-100'
  },
  personalized: {
    label: 'Personalized',
    Icon: UserCheck,
    bar: 'bg-violet-600',
    chip: 'bg-violet-50 text-violet-700 border-violet-100'
  },
  normal: {
    label: 'Normal',
    Icon: MessageSquare,
    bar: 'bg-slate-600',
    chip: 'bg-slate-100 text-slate-700 border-slate-200'
  }
};

function isPostableMessage(m: {
  isPostable?: boolean;
  images?: string[];
  imageUrl?: string;
  contentCategory?: ContentCategory;
}) {
  if (m.contentCategory === 'normal' && !m.isPostable) return false;
  return Boolean(m.isPostable) || Boolean(m.images?.length) || Boolean(m.imageUrl);
}

export const AnalyticsDashboardView: React.FC = () => {
  const {
    conversations,
    users,
    getMessageAction,
    currentUser,
    setActiveTab,
    pendingMarketerRequestsCount
  } = useApp();
  const { isExpandedShell } = useShellLayout();

  const stats = useMemo(() => {
    let total = 0;
    let posted = 0;
    let notPosted = 0;
    let pending = 0;
    const byCategory: Record<ContentCategory, number> = {
      flyer: 0,
      personalized: 0,
      normal: 0
    };
    const reasonMap = new Map<string, number>();
    const marketerMap = new Map<string, MarketerStat>();

    for (const conv of conversations) {
      // Key by conversation thread — admin inbox treats each thread as one marketer
      const marketerId = conv.id;
      if (!marketerMap.has(marketerId)) {
        marketerMap.set(marketerId, {
          id: marketerId,
          name: conv.senderName,
          avatar: conv.senderAvatar,
          total: 0,
          posted: 0,
          notPosted: 0,
          pending: 0,
          rate: 0
        });
      }
      const mStat = marketerMap.get(marketerId)!;

      for (const msg of conv.messages) {
        if (!isPostableMessage(msg)) continue;

        total += 1;
        mStat.total += 1;

        const cat = (msg.contentCategory || 'flyer') as ContentCategory;
        if (cat in byCategory) byCategory[cat] += 1;

        const action = getMessageAction(msg.id);
        const status: PostingStatus = action?.status || msg.postingStatus || 'pending';

        if (status === 'posted') {
          posted += 1;
          mStat.posted += 1;
        } else if (status === 'not_posted') {
          notPosted += 1;
          mStat.notPosted += 1;
          const reason = (action?.reason || 'Other') as string;
          reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
        } else {
          pending += 1;
          mStat.pending += 1;
        }
      }
    }

    const marketers = Array.from(marketerMap.values())
      .map((m) => ({
        ...m,
        rate: m.total > 0 ? Math.round((m.posted / m.total) * 100) : 0
      }))
      .sort((a, b) => b.posted - a.posted || b.rate - a.rate)
      .slice(0, 5);

    const reasons: ReasonCount[] = Array.from(reasonMap.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    const postRate = total > 0 ? Math.round((posted / total) * 100) : 0;
    const responseRate =
      total > 0 ? Math.round(((posted + notPosted) / total) * 100) : 0;

    const allMarketers = users.filter((u) => u.role === 'Marketer');
    const marketerCounts = {
      total: allMarketers.length,
      approved: allMarketers.filter((u) => u.approvalStatus === 'approved').length,
      pending: allMarketers.filter((u) => u.approvalStatus === 'pending').length,
      rejected: allMarketers.filter((u) => u.approvalStatus === 'rejected').length
    };

    return {
      total,
      posted,
      notPosted,
      pending,
      postRate,
      responseRate,
      byCategory,
      reasons,
      marketers,
      marketerCounts,
      threadCount: conversations.length
    };
  }, [conversations, users, getMessageAction]);

  if (currentUser?.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-50">
        <BarChart3 className="w-10 h-10 text-slate-300 mb-3" />
        <p className="text-sm font-bold text-slate-800">Admin access required</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Analytics is available only to Alfa Operations administrators.
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('conversations')}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
        >
          Back to Conversations
        </button>
      </div>
    );
  }

  const maxReason = Math.max(...stats.reasons.map((r) => r.count), 1);
  const maxCategory = Math.max(...Object.values(stats.byCategory), 1);

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 overflow-y-auto">
      <div
        className={`w-full mx-auto p-3 space-y-3 pb-6 ${
          isExpandedShell ? 'max-w-3xl p-4 space-y-4' : 'max-w-md'
        }`}
      >
        {/* Overview strip */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                Overview
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Live from {stats.threadCount} marketer thread
                {stats.threadCount === 1 ? '' : 's'} · All time
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('bulk_sender')}
                className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 cursor-pointer"
                title="Bulk Sender"
              >
                <SendHorizontal className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('marketer_requests')}
                className="relative p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 hover:bg-amber-100 cursor-pointer"
                title="Marketer Requests"
              >
                <UserPlus className="w-4 h-4" />
                {pendingMarketerRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {pendingMarketerRequestsCount > 9 ? '9+' : pendingMarketerRequestsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <KpiCard
              label="Creatives sent"
              value={stats.total}
              icon={<Layers className="w-4 h-4" />}
              tone="blue"
            />
            <KpiCard
              label="Post rate"
              value={`${stats.postRate}%`}
              icon={<Percent className="w-4 h-4" />}
              tone="emerald"
              hint={`${stats.posted} posted`}
            />
            <KpiCard
              label="Pending"
              value={stats.pending}
              icon={<Clock className="w-4 h-4" />}
              tone="amber"
            />
            <KpiCard
              label="Not posted"
              value={stats.notPosted}
              icon={<AlertTriangle className="w-4 h-4" />}
              tone="rose"
            />
          </div>

          {/* Posting funnel bar */}
          <div className="mt-3.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Posting funnel
              </span>
              <span>{stats.responseRate}% responded</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
              {stats.total === 0 ? (
                <div className="w-full h-full bg-slate-200" />
              ) : (
                <>
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(stats.posted / stats.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-rose-400 transition-all"
                    style={{ width: `${(stats.notPosted / stats.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                  />
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-[10px] font-semibold text-slate-500">
              <LegendDot color="bg-emerald-500" label={`Posted ${stats.posted}`} />
              <LegendDot color="bg-rose-400" label={`Not posted ${stats.notPosted}`} />
              <LegendDot color="bg-amber-400" label={`Pending ${stats.pending}`} />
            </div>
          </div>
        </div>

        {/* Marketers */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-3">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Marketers
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <MiniStat label="Total" value={stats.marketerCounts.total} className="bg-slate-50" />
            <MiniStat
              label="Approved"
              value={stats.marketerCounts.approved}
              className="bg-emerald-50 text-emerald-800"
            />
            <MiniStat
              label="Pending"
              value={stats.marketerCounts.pending}
              className="bg-amber-50 text-amber-800"
            />
            <MiniStat
              label="Rejected"
              value={stats.marketerCounts.rejected}
              className="bg-rose-50 text-rose-800"
            />
          </div>
        </section>

        {/* Content mix */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-3">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Content mix
            </span>
          </div>
          <div className="space-y-2.5">
            {(Object.keys(CATEGORY_META) as ContentCategory[]).map((key) => {
              const meta = CATEGORY_META[key];
              const count = stats.byCategory[key];
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              const Icon = meta.Icon;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md border ${meta.chip}`}
                    >
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${meta.bar} transition-all`}
                      style={{ width: `${(count / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Not-posted reasons */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Not-posted reasons
            </span>
          </div>
          {stats.reasons.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No not-posted items yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.reasons.map((r) => (
                <div key={r.reason}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-700 truncate pr-2">
                      {r.reason}
                    </span>
                    <span className="font-bold text-slate-500 shrink-0">{r.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-rose-400 transition-all"
                      style={{ width: `${(r.count / maxReason) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top marketers */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Top marketers
            </span>
          </div>
          {stats.marketers.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No creatives sent yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.marketers.map((m, idx) => (
                <li
                  key={m.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <span className="w-5 text-center text-[11px] font-extrabold text-slate-400">
                    {idx + 1}
                  </span>
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{m.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {m.posted}/{m.total} posted · {m.pending} pending
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border shrink-0 ${
                      m.rate >= 70
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : m.rate >= 40
                          ? 'bg-amber-50 text-amber-800 border-amber-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {m.rate}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

function KpiCard({
  label,
  value,
  icon,
  tone,
  hint
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: 'blue' | 'emerald' | 'amber' | 'rose';
  hint?: string;
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100'
  };
  return (
    <div className={`rounded-xl border p-2.5 ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-1 mb-1 opacity-80">{icon}</div>
      <p className="text-lg font-extrabold leading-none tracking-tight">{value}</p>
      <p className="text-[10px] font-semibold mt-1 opacity-80">{label}</p>
      {hint && <p className="text-[9px] font-medium mt-0.5 opacity-70">{hint}</p>}
    </div>
  );
}

function MiniStat({
  label,
  value,
  className
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={`rounded-xl px-2 py-2 text-center ${className || ''}`}>
      <p className="text-sm font-extrabold leading-none">{value}</p>
      <p className="text-[9px] font-semibold uppercase tracking-wide mt-1 opacity-70">{label}</p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
