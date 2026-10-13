import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Conversation, MessageAction } from '../../types';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Layers,
  SendHorizontal
} from 'lucide-react';

export const ConversationListView: React.FC = () => {
  const { conversations, openConversation, getMessageAction, currentUser, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate image posting metrics for each conversation
  const getPostingCounts = (conv: Conversation) => {
    const imageMessages = conv.messages.filter(
      (m) => (m.images && m.images.length > 0) || Boolean(m.imageUrl) || m.isPostable
    );

    const total = imageMessages.length;
    if (total === 0) return null;

    let posted = 0;
    let notPosted = 0;

    imageMessages.forEach((msg) => {
      const action = getMessageAction(msg.id);
      const status = action?.status || msg.postingStatus || 'pending';
      if (status === 'posted') posted++;
      else if (status === 'not_posted') notPosted++;
    });

    const processed = posted + notPosted;
    const pending = total - processed;

    return {
      total,
      posted,
      notPosted,
      processed,
      pending
    };
  };

  // Filter conversations by search term
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter(
      (c) =>
        c.senderName.toLowerCase().includes(q) ||
        c.senderRole.toLowerCase().includes(q) ||
        c.senderCompany.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // Overall activity overview
  const totalUnread = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 select-none">
      {/* Top Search & Filter Bar */}
      <div className="p-3 sm:p-4 bg-white border-b border-slate-200 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations by marketer or message..."
            className="w-full pl-9 pr-9 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Subtitle / Thread summary info */}
        <div className="flex items-center justify-between mt-2.5 px-0.5 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            {filteredConversations.length}{' '}
            {filteredConversations.length === 1 ? 'Marketer Thread' : 'Marketer Threads'}
          </span>
          <div className="flex items-center gap-2">
            {currentUser?.role === 'Admin' && (
              <button
                type="button"
                onClick={() => setActiveTab('bulk_sender')}
                className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer text-[11px]"
                title="Broadcast flyer or deliver personalized content to multiple marketers"
              >
                <SendHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>Bulk Send Content</span>
              </button>
            )}
            {totalUnread > 0 && (
              <span className="inline-flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                {totalUnread} new {totalUnread === 1 ? 'message' : 'messages'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Conversation Inbox List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-200/70 flex items-center justify-center text-slate-400 mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No conversations found</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              {searchQuery
                ? `No marketers or messages matched "${searchQuery}".`
                : 'Your conversation inbox is currently empty.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const counts = getPostingCounts(conv);

            return (
              <div
                key={conv.id}
                role="button"
                tabIndex={0}
                onClick={() => openConversation(conv.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openConversation(conv.id);
                  }
                }}
                className="w-full text-left bg-white hover:bg-blue-50/40 active:bg-blue-50/70 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-3.5 transition-all shadow-2xs hover:shadow-sm cursor-pointer group focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-start gap-3">
                  {/* Marketer Avatar with Online Indicator */}
                  <div className="relative shrink-0">
                    <img
                      src={conv.senderAvatar}
                      alt={conv.senderName}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-slate-200 shadow-2xs group-hover:ring-2 group-hover:ring-blue-400/50 transition-all"
                      referrerPolicy="no-referrer"
                    />
                    {conv.isOnline && (
                      <span
                        title="Active Now"
                        className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"
                      />
                    )}
                  </div>

                  {/* Conversation Information */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row: Name & Timestamp & Unread */}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 truncate tracking-tight transition-colors">
                          {conv.senderName}
                        </h2>
                        {Boolean(conv.unreadCount && conv.unreadCount > 0) && (
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-2xs">
                            {conv.unreadCount} unread
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-600 shrink-0">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    {/* Role / Company Tag */}
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {conv.senderRole} {conv.senderCompany ? `· ${conv.senderCompany}` : ''}
                    </p>

                    {/* Latest Message Preview */}
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 font-normal leading-relaxed group-hover:text-slate-800">
                      “{conv.lastMessage}”
                    </p>

                    {/* Compact Posting Status Summary (ONLY if image-posting messages exist) */}
                    {counts && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {counts.total} {counts.total === 1 ? 'Post' : 'Posts'}
                        </span>

                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          {counts.posted} Posted
                        </span>

                        {counts.pending > 0 && (
                          <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/70">
                            <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                            {counts.pending} Pending
                          </span>
                        )}

                        {counts.notPosted > 0 && (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            {counts.notPosted} Not Posted
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 ml-auto font-medium hidden xs:inline-block">
                          {counts.processed}/{counts.total} Processed
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Arrow Chevron */}
                  <div className="shrink-0 pt-3 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
