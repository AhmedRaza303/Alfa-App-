import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../navigation/Header';
import { BottomNav } from '../navigation/BottomNav';
import { ConversationListView } from '../conversations/ConversationListView';
import { ConversationDetailView } from '../conversations/ConversationDetailView';
import { NotificationsView } from '../notifications/NotificationsView';
import { ProfileView } from '../profile/ProfileView';
import { BulkContentSenderView } from '../bulk/BulkContentSenderView';
import { NotPostedModal } from '../modals/NotPostedModal';
import { ImageViewerModal } from '../conversations/ImageViewerModal';
import { Toast } from '../common/Toast';
import { Smartphone, Monitor } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { activeTab, activeConversationId, activeConversation, currentUser } = useApp();
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'expanded'>('mobile');

  const isMarketer = currentUser?.role === 'Marketer';

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'conversations':
        if (isMarketer || (activeConversationId && activeConversation)) {
          return <ConversationDetailView />;
        }
        return <ConversationListView />;
      case 'bulk_sender':
        if (!isMarketer && currentUser?.role === 'Admin') {
          return <BulkContentSenderView />;
        }
        return isMarketer ? <ConversationDetailView /> : <ConversationListView />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return isMarketer || (activeConversationId && activeConversation) ? (
          <ConversationDetailView />
        ) : (
          <ConversationListView />
        );
    }
  };

  return (
    <div className="h-screen h-[100dvh] overflow-hidden bg-slate-100 flex flex-col items-center justify-start text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Feedback */}
      <Toast />

      {/* Global Modals */}
      <NotPostedModal />
      <ImageViewerModal />

      {/* Responsive Viewport Switcher (Desktop Preview Bar) */}
      <header className="hidden lg:flex w-full bg-slate-900 text-slate-300 py-2 px-6 items-center justify-between text-xs border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            MarketPulse Workspace
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Marketing Deliverable & Posting Management</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Layout Preview:</span>
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                deviceMode === 'mobile'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('expanded')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                deviceMode === 'expanded'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Tablet / Expanded</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Application Shell */}
      <div
        className={`w-full flex-1 min-h-0 flex flex-col transition-all duration-300 bg-white relative shadow-2xl sm:my-2 lg:my-3 sm:rounded-3xl sm:border sm:border-slate-300/80 sm:overflow-hidden ${
          deviceMode === 'mobile' ? 'max-w-md' : 'max-w-2xl'
        }`}
      >
        {/* Top Header (shown on inbox list and notifications/profile tabs) */}
        {(activeTab !== 'conversations' || (!isMarketer && (!activeConversationId || !activeConversation))) && (
          <Header />
        )}

        {/* Content Body */}
        <main className="flex-1 overflow-hidden flex flex-col min-h-0">
          {renderActiveScreen()}
        </main>

        {/* Bottom Tab Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};
