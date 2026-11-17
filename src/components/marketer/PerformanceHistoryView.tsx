import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useShellLayout } from '../../context/ShellLayoutContext';
import {
  ChatCategoryFilter,
  ChatPostingFilter,
  FlyerCategory,
  Message,
  PostingStatus
} from '../../types';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  UserCheck,
  MessageSquare,
  ChevronRight,
  ClipboardList,
  Languages,
  CalendarRange,
  Sparkles
} from 'lucide-react';
import { getFlyerCategoryLabel } from '../../utils/flyerCategories';

type DateRangeKey = 'all' | 'today' | '7d' | '30d' | 'month';

const pctOf = (count: number, total: number) =>
  total > 0 ? Math.round((count / total) * 100) : 0;

const DATE_RANGES: { key: DateRangeKey; label: string }[] = [
  { key: 'all', label: 'All time' },
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'month', label: 'This month' }
];

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

function rangeBounds(key: DateRangeKey): { from: Date | null; to: Date } {
  const now = new Date();
  const to = now;
  if (key === 'all') return { from: null, to };
  if (key === 'today') return { from: startOfDay(now), to };
  if (key === '7d') {
    const from = startOfDay(now);
    from.setDate(from.getDate() - 6);
    return { from, to };
  }
  if (key === '30d') {
    const from = startOfDay(now);
    from.setDate(from.getDate() - 29);
    return { from, to };
  }
  // this month
  return { from: new Date(now.getFullYear(), now.getMonth(), 1), to };
}

/** Best-effort parse for mock timestamps like "Today · 10:52 PM" / "Yesterday at 02:45 PM" */
function resolveMessageTime(msg: Message): Date | null {
  const raw = `${msg.date || ''} ${msg.timestamp || ''}`.trim();
  if (!raw) return null;

  const isoTry = Date.parse(msg.timestamp);
  if (!Number.isNaN(isoTry) && msg.timestamp.includes('-')) {
    return new Date(isoTry);
  }

  const now = new Date();
  const lower = raw.toLowerCase();
  if (lower.includes('today')) return startOfDay(now);
  if (lower.includes('yesterday')) {
    const y = startOfDay(now);
    y.setDate(y.getDate() - 1);
    return y;
  }

  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) return new Date(parsed);

  // Time-only strings (e.g. "10:15 AM") — treat as today so short ranges still work
  if (/\d{1,2}:\d{2}/.test(raw)) return startOfDay(now);

  return null;
}

function inRange(date: Date | null, from: Date | null, to: Date, allowUnknown: boolean) {
  if (!date) return allowUnknown;
  if (from && date < from) return false;
  if (date > to) return false;
  return true;
}

/** Same rules as ConversationDetailView — keeps Stats pending/posted aligned with Chat chips */
function isPostableMessage(m: Message) {
  return Boolean(
    (m.images && m.images.length > 0) ||
      m.imageUrl ||
      (m.videos && m.videos.length > 0) ||
      m.isPostable ||
      m.postingStatus ||
      m.contentCategory === 'flyer' ||
      m.contentCategory === 'personalized'
  );
}

function isContentMessage(m: Message) {
  if (m.contentCategory) return true;
  if (m.type === 'creative') return true;
  if (isPostableMessage(m)) return true;
  return false;
}

function categoryBucket(m: Message): 'flyer' | 'personalized' | 'others' {
  if (m.contentCategory === 'flyer') return 'flyer';
  if (m.contentCategory === 'personalized') return 'personalized';
  return 'others';
}

/** Pure SVG donut — no chart library */
function DonutChart({
  segments
}: {
  segments: { key: string; value: number; color: string; label: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const size = 148;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  if (total === 0) {
    return (
      <div className="relative w-[148px] h-[148px] mx-auto">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={stroke}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-lg font-extrabold text-slate-300">0</p>
          <p className="text-[9px] font-bold uppercase text-slate-400">items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[148px] h-[148px] mx-auto">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {segments.map((seg) => {
          if (seg.value <= 0) return null;
          const len = (seg.value / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle
              key={seg.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-xl font-extrabold text-slate-900 tabular-nums leading-none">{total}</p>
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
          received
        </p>
      </div>
    </div>
  );
}

export const PerformanceHistoryView: React.FC = () => {
  const {
    currentUser,
    conversations,
    leads,
    language,
    getMessageAction,
    getLanguageRequestForMessage,
    setActiveTab,
    openChatsWithPostingFilter,
    openChatsWithCategoryFilter,
    openLeadsWithAccidentType
  } = useApp();
  const { isExpandedShell } = useShellLayout();
  const [dateRange, setDateRange] = useState<DateRangeKey>('all');

  const data = useMemo(() => {
    const { from, to } = rangeBounds(dateRange);
    // For "all" include undated messages; for bounded ranges still include time-only (treated as today)
    const allowUnknown = dateRange === 'all';

    let posted = 0;
    let notPosted = 0;
    let pending = 0;
    let languageRequested = 0;
    let totalReceived = 0;
    let contentTotal = 0;
    const respondedIds = new Set<string>();
    const byCategory = { flyer: 0, personalized: 0, others: 0 };

    for (const conv of conversations) {
      for (const msg of conv.messages) {
        const msgTime = resolveMessageTime(msg);
        if (!inRange(msgTime, from, to, allowUnknown)) continue;

        // Content mix: any categorized / creative content
        if (isContentMessage(msg)) {
          byCategory[categoryBucket(msg)] += 1;
          contentTotal += 1;
        }

        // Response overview: same postable pool as Chat status chips
        if (!isPostableMessage(msg)) continue;

        totalReceived += 1;

        const action = getMessageAction(msg.id);
        const status: PostingStatus = action?.status || msg.postingStatus || 'pending';
        const hasLang = Boolean(getLanguageRequestForMessage(msg.id));

        // Mutually exclusive buckets so counts sum to totalReceived
        // Posted / Revision win; else Language Requested; else Pending
        if (status === 'posted') {
          posted += 1;
          respondedIds.add(msg.id);
        } else if (status === 'not_posted') {
          notPosted += 1;
          respondedIds.add(msg.id);
        } else if (hasLang) {
          languageRequested += 1;
          respondedIds.add(msg.id);
        } else {
          pending += 1;
        }
      }
    }

    const totalResponses = respondedIds.size;
    const responsePercentage = pctOf(totalResponses, totalReceived);

    const myLeads = currentUser
      ? leads
          .filter((l) => l.createdByUserId === currentUser.id)
          .filter((l) => {
            const d = new Date(l.createdAt);
            if (Number.isNaN(d.getTime())) return allowUnknown;
            return inRange(d, from, to, false);
          })
          .sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      : [];

    const leadTypeMap = new Map<FlyerCategory, number>();
    for (const lead of myLeads) {
      leadTypeMap.set(lead.accidentType, (leadTypeMap.get(lead.accidentType) || 0) + 1);
    }
    const leadTypes = Array.from(leadTypeMap.entries())
      .map(([type, count]) => ({
        type,
        count,
        pct: pctOf(count, myLeads.length)
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalReceived,
      totalResponses,
      responsePercentage,
      posted,
      postedPct: pctOf(posted, totalReceived),
      notPosted,
      notPostedPct: pctOf(notPosted, totalReceived),
      pending,
      pendingPct: pctOf(pending, totalReceived),
      languageRequested,
      languageRequestedPct: pctOf(languageRequested, totalReceived),
      byCategory,
      contentTotal,
      flyerPct: pctOf(byCategory.flyer, contentTotal),
      personalizedPct: pctOf(byCategory.personalized, contentTotal),
      othersPct: pctOf(byCategory.others, contentTotal),
      leadTotal: myLeads.length,
      leadTypes
    };
  }, [
    conversations,
    getMessageAction,
    getLanguageRequestForMessage,
    leads,
    currentUser,
    dateRange
  ]);

  if (currentUser?.role !== 'Marketer') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-50">
        <TrendingUp className="w-10 h-10 text-slate-300 mb-3" />
        <p className="text-sm font-bold text-slate-800">Marketer view only</p>
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

  const maxLeadType = Math.max(...data.leadTypes.map((t) => t.count), 1);

  const openFilter = (key: ChatPostingFilter) => {
    openChatsWithPostingFilter(key);
  };

  const statusRows = [
    {
      key: 'pending' as const,
      label: 'Pending',
      count: data.pending,
      pct: data.pendingPct,
      Icon: Clock,
      bar: 'bg-amber-400',
      chip: 'bg-amber-50 text-amber-900 border-amber-100'
    },
    {
      key: 'not_posted' as const,
      label: 'Revision Requested',
      count: data.notPosted,
      pct: data.notPostedPct,
      Icon: AlertTriangle,
      bar: 'bg-rose-400',
      chip: 'bg-rose-50 text-rose-800 border-rose-100'
    },
    {
      key: 'language_requested' as const,
      label: 'Language Requested',
      count: data.languageRequested,
      pct: data.languageRequestedPct,
      Icon: Languages,
      bar: 'bg-indigo-500',
      chip: 'bg-indigo-50 text-indigo-800 border-indigo-100'
    },
    {
      key: 'posted' as const,
      label: 'Posted',
      count: data.posted,
      pct: data.postedPct,
      Icon: CheckCircle2,
      bar: 'bg-emerald-500',
      chip: 'bg-emerald-50 text-emerald-800 border-emerald-100'
    }
  ];

  const categorySegments = [
    {
      key: 'flyer',
      label: 'Flyers',
      value: data.byCategory.flyer,
      pct: data.flyerPct,
      color: '#3b82f6',
      Icon: Layers,
      chip: 'bg-blue-50 text-blue-700 border-blue-100'
    },
    {
      key: 'personalized',
      label: 'Personalized',
      value: data.byCategory.personalized,
      pct: data.personalizedPct,
      color: '#7c3aed',
      Icon: UserCheck,
      chip: 'bg-violet-50 text-violet-800 border-violet-100'
    },
    {
      key: 'others',
      label: 'Others',
      value: data.byCategory.others,
      pct: data.othersPct,
      color: '#94a3b8',
      Icon: MessageSquare,
      chip: 'bg-slate-100 text-slate-700 border-slate-200'
    }
  ];

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 overflow-y-auto">
      <div
        className={`w-full mx-auto p-3 space-y-3 pb-6 ${
          isExpandedShell ? 'max-w-3xl p-4 space-y-4' : 'max-w-md'
        }`}
      >
        {/* Date range */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-2">
            <CalendarRange className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Period
            </span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-0.5 -mx-0.5 px-0.5">
            {DATE_RANGES.map((r) => {
              const active = dateRange === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setDateRange(r.key)}
                  className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-bold border transition-colors cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Message Response Overview */}
        <section
          className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs"
          data-tour="stats-overview"
        >
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Message Response Overview
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Total responses
              </p>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums leading-none">
                {data.totalResponses}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1">
                of {data.totalReceived} received
              </p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/80 mb-1">
                Response %
              </p>
              <p className="text-2xl font-extrabold text-emerald-950 tabular-nums leading-none">
                {data.responsePercentage}%
              </p>
              <p className="text-[10px] font-semibold text-emerald-800/70 mt-1">
                vs total received
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              By status · tap to open in Chat
            </p>
            {statusRows.map((row) => {
              const Icon = row.Icon;
              return (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => openFilter(row.key)}
                  className="w-full text-left rounded-xl border border-slate-100 bg-white p-2.5 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md border ${row.chip}`}
                    >
                      <Icon className="w-3 h-3" />
                      {row.label} ({row.count})
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-600 tabular-nums">
                      {row.pct}%
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${row.bar} transition-all`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Lead Capture Summary */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Lead Capture Summary
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('leads')}
              className="text-[10px] font-bold text-sky-700 hover:underline cursor-pointer"
            >
              Open leads
            </button>
          </div>

          <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700/80 mb-1">
              Total leads captured
            </p>
            <p className="text-3xl font-extrabold text-sky-950 tabular-nums leading-none">
              {data.leadTotal}
            </p>
            <p className="text-[10px] font-semibold text-sky-700/70 mt-1">
              Successfully submitted in this period
            </p>
          </div>

          {data.leadTotal === 0 ? (
            <p className="text-xs text-slate-400 font-medium py-1">
              No leads in this period — capture one from the Leads tab.
            </p>
          ) : (
            <>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Accident type breakdown
              </p>
              <div className="space-y-2">
                {data.leadTypes.map(({ type, count, pct }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => openLeadsWithAccidentType(type)}
                    className="w-full text-left rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 hover:bg-sky-50/60 hover:border-sky-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700 truncate">
                        {getFlyerCategoryLabel(type, language)} ({count})
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-600 tabular-nums shrink-0">
                        {pct}%
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white border border-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all"
                        style={{ width: `${(count / maxLeadType) * 100}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Content Category Distribution */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-3">
            <Layers className="w-3.5 h-3.5 text-violet-600" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Content Category Distribution
            </span>
          </div>

          <DonutChart
            segments={categorySegments.map((s) => ({
              key: s.key,
              value: s.value,
              color: s.color,
              label: s.label
            }))}
          />

          <p className="mt-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Tap a category to open in Chat
          </p>
          <div className="space-y-2">
            {categorySegments.map((seg) => {
              const Icon = seg.Icon;
              const isPersonalized = seg.key === 'personalized';
              return (
                <button
                  key={seg.key}
                  type="button"
                  onClick={() =>
                    openChatsWithCategoryFilter(seg.key as ChatCategoryFilter)
                  }
                  className={`w-full text-left rounded-xl border p-2.5 transition-colors cursor-pointer ${
                    isPersonalized
                      ? 'border-violet-200 bg-violet-50/80 ring-1 ring-violet-100 hover:bg-violet-50'
                      : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md border ${seg.chip}`}
                      >
                        <Icon className="w-3 h-3" />
                        {seg.label} ({seg.value})
                      </span>
                      {isPersonalized && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase text-violet-700">
                          <Sparkles className="w-2.5 h-2.5" />
                          Custom
                        </span>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-600 tabular-nums shrink-0">
                      {seg.pct}%
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </span>
                  </div>
                  {isPersonalized && (
                    <p className="text-[10px] text-violet-700/80 font-medium mt-1.5 leading-snug">
                      Personalized content needs extra company effort — track how much custom
                      material you receive vs standard flyers.
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
