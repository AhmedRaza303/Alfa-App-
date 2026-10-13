import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useShellLayout } from '../../context/ShellLayoutContext';
import { ContentCategory, Message, PostingStatus } from '../../types';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Percent,
  Flame,
  Layers,
  UserCheck,
  MessageSquare,
  ChevronRight,
  History
} from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageAssets';

type HistoryItem = {
  message: Message;
  status: PostingStatus;
  reason?: string;
  actionTime?: string;
};

type StatusFilter = 'all' | PostingStatus;

const CATEGORY_ICON: Record<
  ContentCategory,
  { Icon: React.ElementType; chip: string; label: string }
> = {
  flyer: {
    Icon: Layers,
    chip: 'bg-blue-50 text-blue-700 border-blue-100',
    label: 'Flyer'
  },
  personalized: {
    Icon: UserCheck,
    chip: 'bg-violet-50 text-violet-700 border-violet-100',
    label: 'Personalized'
  },
  normal: {
    Icon: MessageSquare,
    chip: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Normal'
  }
};

function isPostableMessage(m: Message) {
  if (m.contentCategory === 'normal' && !m.isPostable) return false;
  return Boolean(m.isPostable) || Boolean(m.images?.length) || Boolean(m.imageUrl);
}

function statusMeta(status: PostingStatus) {
  if (status === 'posted') {
    return {
      label: 'Posted',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      Icon: CheckCircle2
    };
  }
  if (status === 'not_posted') {
    return {
      label: 'Not posted',
      className: 'bg-rose-50 text-rose-700 border-rose-100',
      Icon: AlertTriangle
    };
  }
  return {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-800 border-amber-100',
    Icon: Clock
  };
}

export const PerformanceHistoryView: React.FC = () => {
  const {
    currentUser,
    conversations,
    getMessageAction,
    openConversation,
    setActiveTab,
    pendingActionsCount
  } = useApp();
  const { isExpandedShell } = useShellLayout();
  const [filter, setFilter] = useState<StatusFilter>('all');

  const data = useMemo(() => {
    const items: HistoryItem[] = [];
    let posted = 0;
    let notPosted = 0;
    let pending = 0;
    const byCategory: Record<ContentCategory, number> = {
      flyer: 0,
      personalized: 0,
      normal: 0
    };

    for (const conv of conversations) {
      for (const msg of conv.messages) {
        if (!isPostableMessage(msg)) continue;
        const action = getMessageAction(msg.id);
        const status: PostingStatus = action?.status || msg.postingStatus || 'pending';
        const cat = (msg.contentCategory || 'flyer') as ContentCategory;
        if (cat in byCategory) byCategory[cat] += 1;

        if (status === 'posted') posted += 1;
        else if (status === 'not_posted') notPosted += 1;
        else pending += 1;

        items.push({
          message: msg,
          status,
          reason: action?.reason,
          actionTime: action?.postedAt || action?.timestamp || msg.timestamp
        });
      }
    }

    // Newest first (messages are chronological in thread — reverse)
    items.reverse();

    const total = items.length;
    const postRate = total > 0 ? Math.round((posted / total) * 100) : 0;
    const completed = posted + notPosted;
    const responseRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Streak: consecutive posted from the most recent resolved items
    let streak = 0;
    for (const item of items) {
      if (item.status === 'pending') continue;
      if (item.status === 'posted') streak += 1;
      else break;
    }

    return {
      items,
      total,
      posted,
      notPosted,
      pending,
      postRate,
      responseRate,
      streak,
      byCategory
    };
  }, [conversations, getMessageAction]);

  const filtered = useMemo(() => {
    if (filter === 'all') return data.items;
    return data.items.filter((i) => i.status === filter);
  }, [data.items, filter]);

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

  const maxCategory = Math.max(...Object.values(data.byCategory), 1);

  const handleOpenItem = (item: HistoryItem) => {
    openConversation(item.message.conversationId, item.message.id);
    setActiveTab('conversations');
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 overflow-y-auto">
      <div
        className={`w-full mx-auto p-3 space-y-3 pb-6 ${
          isExpandedShell ? 'max-w-3xl p-4 space-y-4' : 'max-w-md'
        }`}
      >
        {/* Summary */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Your performance
              </span>
            </div>
            {pendingActionsCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('conversations')}
                className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md cursor-pointer"
              >
                {pendingActionsCount} pending →
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Post rate"
              value={`${data.postRate}%`}
              icon={<Percent className="w-4 h-4" />}
              tone="emerald"
              hint={`${data.posted} of ${data.total}`}
            />
            <StatCard
              label="Posted streak"
              value={data.streak}
              icon={<Flame className="w-4 h-4" />}
              tone="orange"
              hint="Recent posted in a row"
            />
            <StatCard
              label="Pending"
              value={data.pending}
              icon={<Clock className="w-4 h-4" />}
              tone="amber"
            />
            <StatCard
              label="Not posted"
              value={data.notPosted}
              icon={<AlertTriangle className="w-4 h-4" />}
              tone="rose"
            />
          </div>

          <div className="mt-3.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
              <span>Activity breakdown</span>
              <span>{data.responseRate}% completed</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
              {data.total === 0 ? (
                <div className="w-full h-full bg-slate-200" />
              ) : (
                <>
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(data.posted / data.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-rose-400"
                    style={{ width: `${(data.notPosted / data.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${(data.pending / data.total) * 100}%` }}
                  />
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-[10px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Posted {data.posted}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Not posted {data.notPosted}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Pending {data.pending}
              </span>
            </div>
          </div>
        </section>

        {/* Content mix */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-3">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Content received
            </span>
          </div>
          <div className="space-y-2.5">
            {(Object.keys(CATEGORY_ICON) as ContentCategory[]).map((key) => {
              const meta = CATEGORY_ICON[key];
              const count = data.byCategory[key];
              const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
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
                      className={`h-full ${
                        key === 'flyer'
                          ? 'bg-blue-600'
                          : key === 'personalized'
                            ? 'bg-violet-600'
                            : 'bg-slate-600'
                      }`}
                      style={{ width: `${(count / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* History */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                History
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">
              {filtered.length} item{filtered.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {(
              [
                { key: 'all' as const, label: 'All', count: data.total },
                { key: 'posted' as const, label: 'Posted', count: data.posted },
                { key: 'pending' as const, label: 'Pending', count: data.pending },
                { key: 'not_posted' as const, label: 'Held', count: data.notPosted }
              ] as const
            ).map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`rounded-xl px-1.5 py-1.5 text-center border transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-extrabold leading-none">{f.count}</p>
                  <p className="text-[9px] font-semibold mt-1 opacity-80">{f.label}</p>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="py-8 text-center">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No items in this filter</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Creatives you receive will show up here.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((item) => {
                const msg = item.message;
                const meta = statusMeta(item.status);
                const StatusIcon = meta.Icon;
                const cat = (msg.contentCategory || 'flyer') as ContentCategory;
                const catMeta = CATEGORY_ICON[cat] || CATEGORY_ICON.flyer;
                const CatIcon = catMeta.Icon;
                const thumb =
                  msg.images?.[0] || msg.imageUrl
                    ? resolveImageUrl(msg.images?.[0] || msg.imageUrl || '')
                    : null;

                return (
                  <li key={msg.id}>
                    <button
                      type="button"
                      onClick={() => handleOpenItem(item)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-left transition-colors cursor-pointer"
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div
                          className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 ${catMeta.chip}`}
                        >
                          <CatIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {msg.campaignName || msg.caption || msg.text || 'Creative'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${catMeta.chip}`}
                          >
                            <CatIcon className="w-2.5 h-2.5" />
                            {catMeta.label}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {item.actionTime || msg.date || ''}
                          </span>
                        </div>
                        {item.status === 'not_posted' && item.reason && (
                          <p className="text-[10px] text-rose-600 mt-0.5 truncate">
                            {item.reason}
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border shrink-0 ${meta.className}`}
                      >
                        <StatusIcon className="w-2.5 h-2.5" />
                        {meta.label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

function StatCard({
  label,
  value,
  icon,
  tone,
  hint
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: 'emerald' | 'amber' | 'rose' | 'orange';
  hint?: string;
}) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100'
  };
  return (
    <div className={`rounded-xl border p-2.5 ${tones[tone]}`}>
      <div className="opacity-80 mb-1">{icon}</div>
      <p className="text-lg font-extrabold leading-none tracking-tight">{value}</p>
      <p className="text-[10px] font-semibold mt-1 opacity-80">{label}</p>
      {hint && <p className="text-[9px] font-medium mt-0.5 opacity-70">{hint}</p>}
    </div>
  );
}
