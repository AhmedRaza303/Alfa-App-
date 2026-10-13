import React from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCheck
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    openConversation,
    unreadNotificationCount
  } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'posted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'not_posted':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'content_required':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'posted':
        return 'bg-emerald-50 border-emerald-200';
      case 'not_posted':
        return 'bg-amber-50 border-amber-200';
      case 'content_required':
        return 'bg-blue-50 border-blue-200';
      case 'message':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-slate-100 border-slate-200';
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) {
      markNotificationAsRead(item.id);
    }
    if (item.conversationId) {
      openConversation(item.conversationId, item.messageId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top action bar */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-900 block">
            Activity & Deliverable Feed
          </span>
          <span className="text-[11px] text-slate-500">
            {unreadNotificationCount > 0
              ? `${unreadNotificationCount} unread alert${unreadNotificationCount > 1 ? 's' : ''}`
              : 'All notifications read'}
          </span>
        </div>

        {unreadNotificationCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="min-h-[36px] px-3 py-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 transition-colors flex items-start gap-3.5 cursor-pointer hover:bg-slate-100/70 active:bg-slate-200/50 ${
                !item.read ? 'bg-blue-50/40' : 'bg-white'
              }`}
            >
              {/* Type Icon */}
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getIconBg(
                  item.type
                )}`}
              >
                {getIcon(item.type)}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3
                    className={`text-xs sm:text-sm truncate ${
                      !item.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {item.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-1.5">
                  {item.description}
                </p>

                {item.conversationId && (
                  <span className="inline-flex items-center text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                    View deliverable thread →
                  </span>
                )}
              </div>

              {/* Unread indicator */}
              {!item.read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              You're all caught up
            </h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              No new alerts or deliverable actions. New flyer deliveries and posting updates will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
