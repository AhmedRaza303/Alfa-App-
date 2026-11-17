import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useShellLayout } from '../../context/ShellLayoutContext';
import {
  CalendarDays,
  Clock,
  Send,
  X,
  ArrowRight,
  Image as ImageIcon,
  Video,
  Users,
  CheckCircle2,
  Ban,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { ScheduledSend, ScheduledSendStatus } from '../../types';

type FilterTab = 'upcoming' | 'sent' | 'cancelled' | 'all';

const statusTone: Record<
  ScheduledSendStatus,
  { label: string; className: string }
> = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  sent: {
    label: 'Sent',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-600 border-slate-200'
  }
};

const categoryLabel = (c: ScheduledSend['category']) =>
  c === 'flyer' ? 'Flyer' : c === 'personalized' ? 'Personalized' : 'Normal';

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function groupKey(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, tomorrow)) return 'Tomorrow';
  return d.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
}

export const ContentCalendarView: React.FC = () => {
  const {
    currentUser,
    scheduledSends,
    cancelScheduledSend,
    sendScheduledNow,
    setActiveTab,
    upcomingScheduledCount
  } = useApp();
  const { isExpandedShell } = useShellLayout();
  const [filter, setFilter] = useState<FilterTab>('upcoming');

  const filtered = useMemo(() => {
    let list = [...scheduledSends];
    if (filter === 'upcoming') list = list.filter((s) => s.status === 'scheduled');
    else if (filter === 'sent') list = list.filter((s) => s.status === 'sent');
    else if (filter === 'cancelled') list = list.filter((s) => s.status === 'cancelled');

    list.sort((a, b) => {
      if (filter === 'upcoming') {
        return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
      }
      return new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime();
    });
    return list;
  }, [scheduledSends, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, ScheduledSend[]>();
    filtered.forEach((item) => {
      const key = groupKey(item.scheduledFor);
      const arr = map.get(key) || [];
      arr.push(item);
      map.set(key, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  if (currentUser?.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-50">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-3 shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-slate-800 mb-1">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-xs mb-4">
          Only administrators can manage the content calendar.
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('conversations')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          Return to Conversations
        </button>
      </div>
    );
  }

  const tabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: 'upcoming', label: 'Upcoming', count: upcomingScheduledCount },
    {
      id: 'sent',
      label: 'Sent',
      count: scheduledSends.filter((s) => s.status === 'sent').length
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      count: scheduledSends.filter((s) => s.status === 'cancelled').length
    },
    { id: 'all', label: 'All', count: scheduledSends.length }
  ];

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 overflow-y-auto">
      <div
        className={`w-full mx-auto p-3 space-y-3 pb-6 ${
          isExpandedShell ? 'max-w-3xl p-4 space-y-4' : 'max-w-md'
        }`}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                Content Calendar
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {upcomingScheduledCount === 0
                  ? 'No flyers waiting to send'
                  : `${upcomingScheduledCount} scheduled send${
                      upcomingScheduledCount === 1 ? '' : 's'
                    } queued`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('bulk_sender')}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>Schedule new</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  filter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 bg-slate-50 border border-slate-200'
                }`}
              >
                {tab.label}
                {typeof tab.count === 'number' && tab.count > 0 ? (
                  <span
                    className={`ml-1 ${
                      filter === tab.id ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Nothing here yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Compose a flyer in Bulk Sender and pick a send time to add it to the calendar.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('bulk_sender')}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
            >
              Open Bulk Sender
            </button>
          </div>
        ) : (
          grouped.map(([day, items]) => (
            <div key={day} className="space-y-2">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 px-0.5">
                {day}
              </h3>
              {items.map((item) => {
                const tone = statusTone[item.status];
                const mediaCount =
                  item.images.length + (item.videos?.length || 0);
                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${tone.className}`}
                          >
                            {tone.label}
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
                            {categoryLabel(item.category)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1.5 truncate">
                          {item.title}
                        </h4>
                        {item.text ? (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {item.text}
                          </p>
                        ) : null}
                      </div>
                      {item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3 h-3 text-blue-600" />
                        {formatWhen(item.scheduledFor)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {item.recipientLabel}
                      </span>
                      {mediaCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          {item.videos && item.videos.length > 0 ? (
                            <Video className="w-3 h-3" />
                          ) : (
                            <ImageIcon className="w-3 h-3" />
                          )}
                          {mediaCount} media
                        </span>
                      )}
                    </div>

                    {item.status === 'scheduled' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => sendScheduledNow(item.id)}
                          className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send now
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelScheduledSend(item.id)}
                          className="py-2 px-3 rounded-xl text-[11px] font-bold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>
                    )}

                    {item.status === 'sent' && item.sentAt && (
                      <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Delivered {formatWhen(item.sentAt)}
                      </div>
                    )}
                    {item.status === 'cancelled' && (
                      <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                        <Ban className="w-3 h-3" />
                        Cancelled — will not send
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
