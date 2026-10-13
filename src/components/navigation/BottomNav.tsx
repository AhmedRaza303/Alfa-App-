import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Bell,
  User as UserIcon,
  SendHorizontal,
  UserPlus,
  BarChart3,
  GitBranch,
  ClipboardList,
  TrendingUp
} from 'lucide-react';
import { ActiveTab } from '../../types';

export const BottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    unreadNotificationCount,
    pendingActionsCount,
    pendingMarketerRequestsCount,
    currentUser,
    activeConversationId,
    closeConversation
  } = useApp();

  const isAdmin = currentUser?.role === 'Admin';
  const isMarketer = currentUser?.role === 'Marketer';

  const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      tab: 'conversations',
      label: 'Chats',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: pendingActionsCount
    },
    ...(isAdmin
      ? [
          {
            tab: 'analytics' as ActiveTab,
            label: 'Analytics',
            icon: <BarChart3 className="w-5 h-5" />
          },
          {
            tab: 'marketer_requests' as ActiveTab,
            label: 'Requests',
            icon: <UserPlus className="w-5 h-5" />,
            badge: pendingMarketerRequestsCount
          },
          {
            tab: 'bulk_sender' as ActiveTab,
            label: 'Bulk',
            icon: <SendHorizontal className="w-5 h-5" />
          }
        ]
      : []),
    {
      tab: 'leads',
      label: 'Leads',
      icon: <ClipboardList className="w-5 h-5" />
    },
    ...(isMarketer
      ? [
          {
            tab: 'performance' as ActiveTab,
            label: 'Stats',
            icon: <TrendingUp className="w-5 h-5" />
          },
          {
            tab: 'referrals' as ActiveTab,
            label: 'Referrals',
            icon: <GitBranch className="w-5 h-5" />
          }
        ]
      : []),
    {
      tab: 'notifications',
      label: 'Alerts',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadNotificationCount
    },
    {
      tab: 'profile',
      label: 'Profile',
      icon: currentUser?.avatar ? (
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-5 h-5 rounded-full object-cover border border-slate-300"
          referrerPolicy="no-referrer"
        />
      ) : (
        <UserIcon className="w-5 h-5" />
      )
    }
  ];

  const cols = isAdmin ? 7 : isMarketer ? 6 : 4;

  return (
    <nav className="relative z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shrink-0">
      <div className={`max-w-md mx-auto grid grid-cols-${cols} h-14 px-0.5 sm:px-1`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => {
                if (item.tab === 'conversations') {
                  if (
                    currentUser?.role === 'Admin' &&
                    activeTab === 'conversations' &&
                    activeConversationId
                  ) {
                    closeConversation();
                  } else {
                    setActiveTab('conversations');
                  }
                } else {
                  setActiveTab(item.tab);
                }
              }}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center relative py-1 transition-colors ${
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                {item.icon}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-xs">
                    {item.badge! > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight truncate max-w-full px-0.5 ${
                  isActive ? 'font-bold text-blue-600' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
