import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { currentUser, activeTab } = useApp();

  const getDefaultTitle = () => {
    switch (activeTab) {
      case 'conversations':
        return currentUser?.role === 'Admin' ? 'All Marketers / Conversations' : 'Conversations';
      case 'bulk_sender':
        return 'Bulk Content Sender';
      case 'notifications':
        return 'Notifications';
      case 'profile':
        return currentUser?.role === 'Admin' ? 'Admin Profile' : 'Marketer Profile';
      default:
        return 'MarketPulse';
    }
  };

  const getDefaultSubtitle = () => {
    switch (activeTab) {
      case 'conversations':
        return currentUser?.role === 'Admin'
          ? 'Team deliverable queues & posting management'
          : 'Content delivery & posting queue';
      case 'bulk_sender':
        return 'Broadcast flyers & distribute personalized deliverables';
      case 'notifications':
        return 'Activity feed & deliverable alerts';
      case 'profile':
        return currentUser?.role === 'Admin'
          ? 'Administrator credentials & security'
          : 'Account credentials & settings';
      default:
        return '';
    }
  };

  const displayTitle = title || getDefaultTitle();
  const displaySubtitle = subtitle || getDefaultSubtitle();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 truncate tracking-tight">
              {displayTitle}
            </h1>
            <span className="hidden xs:inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              Verified
            </span>
          </div>
          {displaySubtitle && (
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {displaySubtitle}
            </p>
          )}
        </div>

        {/* Current Active Marketer Avatar preview (NO SWITCH USER) */}
        {currentUser && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {currentUser.role || 'Marketer'}
              </span>
            </div>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-300 shadow-2xs"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>
    </header>
  );
};
