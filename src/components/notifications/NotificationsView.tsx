import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationItem, NotificationType } from '../../types';
import {
  formatNotificationWhen,
  notificationCategoryLabel
} from '../../utils/notifications';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCheck,
  ClipboardList,
  Users,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    openConversation,
    unreadNotificationCount,
    setActiveTab,
    currentUser
  } = useApp();

  const isMarketer = currentUser?.role === 'Marketer';

  const sections = useMemo(() => {
    const unread = notifications.filter((n) => !n.read);
    const read = notifications.filter((n) => n.read);
    return { unread, read };
  }, [notifications]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'posted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'not_posted':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'new_message':
      case 'message':
      case 'content_required':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'message_update':
        return <RefreshCw className="w-4 h-4 text-indigo-600" />;
      case 'lead_update':
        return <ClipboardList className="w-4 h-4 text-sky-600" />;
      case 'team_application':
        return <Users className="w-4 h-4 text-violet-600" />;
      case 'approval_update':
        return <ShieldCheck className="w-4 h-4 text-emerald-700" />;
      case 'action_reminder':
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case 'posted':
      case 'approval_update':
        return 'bg-emerald-50 border-emerald-200';
      case 'not_posted':
      case 'action_reminder':
        return 'bg-amber-50 border-amber-200';
      case 'new_message':
      case 'message':
      case 'content_required':
        return 'bg-blue-50 border-blue-200';
      case 'message_update':
        return 'bg-indigo-50 border-indigo-200';
      case 'lead_update':
        return 'bg-sky-50 border-sky-200';
      case 'team_application':
        return 'bg-violet-50 border-violet-200';
      default:
        return 'bg-slate-100 border-slate-200';
    }
  };

  const actionHint = (item: NotificationItem): string | null => {
    if (item.conversationId || item.messageId) return 'Open in Chats →';
    if (item.leadId) return 'Open in Leads →';
    if (item.type === 'team_application' || item.relatedUserId) return 'Open Referrals →';
    if (item.type === 'approval_update') return 'Open Profile →';
    return null;
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) markNotificationAsRead(item.id);

    if (item.conversationId) {
      openConversation(item.conversationId, item.messageId);
      return;
    }
    if (item.leadId) {
      setActiveTab('leads');
      return;
    }
    if (item.type === 'team_application' || item.relatedUserId) {
      setActiveTab(isMarketer ? 'referrals' : 'marketer_requests');
      return;
    }
    if (item.type === 'approval_update') {
      setActiveTab('profile');
    }
  };

  const renderRow = (item: NotificationItem) => {
    const when = formatNotificationWhen(item.createdAt, item.timestamp);
    const hint = actionHint(item);

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNotificationClick(item)}
        className={`w-full text-left p-4 transition-colors flex items-start gap-3.5 cursor-pointer border-b border-slate-100 last:border-b-0 ${
          !item.read
            ? 'bg-blue-50/50 hover:bg-blue-50'
            : 'bg-white hover:bg-slate-50'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getIconBg(
            item.type
          )}`}
        >
          {getIcon(item.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {notificationCategoryLabel(item.type)}
              </span>
              <h3
                className={`text-xs sm:text-sm truncate ${
                  !item.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                }`}
              >
                {item.title}
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 shrink-0 tabular-nums pt-0.5">
              {when}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-1.5">{item.description}</p>

          {hint && (
            <span className="inline-flex items-center text-[11px] font-semibold text-blue-600">
              {hint}
            </span>
          )}
        </div>

        {!item.read ? (
          <span
            className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2"
            title="Unread"
            aria-label="Unread"
          />
        ) : (
          <span className="text-[9px] font-bold uppercase tracking-wide text-slate-300 shrink-0 mt-1.5">
            Read
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50" data-tour="alerts-list">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
        <div>
          <span className="text-xs font-bold text-slate-900 block">Alerts</span>
          <span className="text-[11px] text-slate-500">
            {unreadNotificationCount > 0
              ? `${unreadNotificationCount} unread · newest first`
              : 'All caught up · history stays here'}
          </span>
        </div>

        {unreadNotificationCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="min-h-[36px] px-3 py-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">No alerts yet</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              New messages, lead updates, and team application changes will show up here
              automatically.
            </p>
          </div>
        ) : (
          <>
            {sections.unread.length > 0 && (
              <section>
                <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200 sticky top-0 z-10">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                    Unread ({sections.unread.length})
                  </span>
                </div>
                {sections.unread.map(renderRow)}
              </section>
            )}
            {sections.read.length > 0 && (
              <section>
                <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200 sticky top-0 z-10">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Earlier ({sections.read.length})
                  </span>
                </div>
                {sections.read.map(renderRow)}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};
