import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ContentMessageCard } from './ContentMessageCard';
import {
  Send,
  CheckCircle2,
  ArrowLeft,
  Bell,
  MoreVertical,
  Clock,
  Filter,
  FileText,
  XCircle,
  ChevronDown,
  RotateCcw,
  ImagePlus,
  X,
  Smile
} from 'lucide-react';
import { Message } from '../../types';

type PostingFilter = 'all' | 'pending' | 'posted' | 'not_posted';
type CategoryFilter = 'all' | 'flyer' | 'personalized' | 'normal';

const EMOJI_LIST = [
  '🚀', '📢', '🎯', '🔥', '✨', '💼', '📈', '💡', '📅', '🏷️',
  '📦', '👏', '👍', '🎉', '⭐', '💰', '📊', '⚡', '📝', '📣',
  '🤝', '🏆', '🕒', '🎨', '💬', '🔔', '📌', '🌟', '💯', '📱',
  '🌐', '🛍️', '💎', '⏳', '✅', '❤️'
];

export const ConversationDetailView: React.FC = () => {
  const {
    activeConversation,
    closeConversation,
    currentUser,
    sendMessage,
    targetMessageId,
    setTargetMessageId,
    markMessagesAsRead,
    getMessageAction,
    setActiveTab,
    unreadNotificationCount
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PostingFilter>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<CategoryFilter>('all');
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const initialAnchorDoneRef = useRef(false);

  // Category and attachment state for Admin
  const [contentType, setContentType] = useState<'flyer' | 'personalized' | 'normal'>('flyer');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInsertEmoji = (emoji: string) => {
    if (!inputRef.current) {
      setInputText((prev) => prev + emoji);
      setShowEmojiPicker(false);
      return;
    }
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const nextText = inputText.substring(0, start) + emoji + inputText.substring(end);
    setInputText(nextText);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(start + emoji.length, start + emoji.length);
      }
    }, 10);
    setShowEmojiPicker(false);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAttachError(null);

    const fileList = Array.from(files);
    if (attachedImages.length + fileList.length > 3) {
      setAttachError('Maximum 3 images allowed per message.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const readers: Promise<string>[] = [];
    for (const file of fileList) {
      if (!file.type.startsWith('image/')) {
        setAttachError('Only image files (JPEG, PNG, WebP) are supported.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setAttachError('Each image must be under 8MB.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      readers.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        })
      );
    }

    Promise.all(readers).then((newImages) => {
      setAttachedImages((prev) => [...prev, ...newImages].slice(0, 3));
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const removeAttachment = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, idx) => idx !== index));
    setAttachError(null);
  };

  // Reset filters whenever a new conversation is opened
  useEffect(() => {
    setActiveFilter('all');
    setActiveCategoryFilter('all');
  }, [activeConversation?.id]);

  // If no active conversation exists, fallback gracefully
  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-slate-400 text-xs">
        No conversation loaded.
      </div>
    );
  }

  // Count unread received messages
  const unreadCount = useMemo(() => {
    return activeConversation.messages.filter(
      (m: Message) => m.senderId !== currentUser?.id && m.isRead === false
    ).length;
  }, [activeConversation.messages, currentUser?.id]);

  // Posting counts: calculated from messages containing images/flyers
  const imagePostingCounts = useMemo(() => {
    const imageMessages = activeConversation.messages.filter(
      (m: Message) => Boolean((m.images && m.images.length > 0) || m.imageUrl)
    );

    if (imageMessages.length === 0) return null;

    let postedCount = 0;
    let notPostedCount = 0;

    imageMessages.forEach((m: Message) => {
      const act = getMessageAction(m.id);
      const st = act?.status || m.postingStatus || 'pending';
      if (st === 'posted') postedCount++;
      else if (st === 'not_posted') notPostedCount++;
    });

    const pendingCount = imageMessages.length - postedCount - notPostedCount;

    return {
      total: imageMessages.length,
      posted: postedCount,
      notPosted: notPostedCount,
      pending: pendingCount
    };
  }, [activeConversation.messages, getMessageAction]);

  // Auto-mark received messages as read as marketer spends time viewing
  useEffect(() => {
    if (unreadCount > 0 && activeConversation?.id) {
      const readTimer = setTimeout(() => {
        markMessagesAsRead(activeConversation.id);
      }, 2500);
      return () => clearTimeout(readTimer);
    }
  }, [unreadCount, activeConversation?.id, markMessagesAsRead]);

  // Target message navigation or initial anchor
  useEffect(() => {
    if (targetMessageId) {
      let attempts = 0;
      let highlightTimer: NodeJS.Timeout | null = null;

      const findAndScroll = () => {
        const targetEl = document.getElementById(`message-${targetMessageId}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedId(targetMessageId);

          highlightTimer = setTimeout(() => {
            setHighlightedId(null);
            setTargetMessageId(null);
          }, 2000);
        } else if (attempts < 6) {
          attempts++;
          setTimeout(findAndScroll, 60);
        }
      };

      const initialTimer = setTimeout(findAndScroll, 50);
      return () => {
        clearTimeout(initialTimer);
        if (highlightTimer) clearTimeout(highlightTimer);
      };
    } else if (!initialAnchorDoneRef.current) {
      initialAnchorDoneRef.current = true;
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
    }
  }, [targetMessageId, setTargetMessageId]);

  // Filtered messages combining Posting Status Filter and Category Filter
  const filteredMessages = useMemo(() => {
    if (!activeConversation) return [];

    return activeConversation.messages.filter((m: Message) => {
      // 1. Posting Status Filter
      if (activeFilter !== 'all') {
        const isSubjectToPosting = Boolean(
          (m.images && m.images.length > 0) || m.imageUrl || m.isPostable || m.postingStatus
        );
        if (!isSubjectToPosting) return false;

        const act = getMessageAction(m.id);
        const st = act?.status || m.postingStatus || 'pending';
        if (st !== activeFilter) return false;
      }

      // 2. Category Filter
      if (activeCategoryFilter !== 'all') {
        if (activeCategoryFilter === 'flyer') {
          if (m.contentCategory !== 'flyer') return false;
        } else if (activeCategoryFilter === 'personalized') {
          if (m.contentCategory !== 'personalized') return false;
        } else if (activeCategoryFilter === 'normal') {
          // Normal = explicit normal category, or plain text chat (no flyer/personalized)
          const isNormal =
            m.contentCategory === 'normal' ||
            (!m.contentCategory && m.type === 'text' && !m.isPostable);
          if (!isNormal) return false;
        }
      }

      return true;
    });
  }, [activeConversation, activeFilter, activeCategoryFilter, getMessageAction]);

  const handleClearFilters = () => {
    setActiveFilter('all');
    setActiveCategoryFilter('all');
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const hasText = Boolean(inputText.trim());
    const hasAttachments = attachedImages.length > 0;
    if (!hasText && !hasAttachments) return;

    if (currentUser?.role === 'Admin') {
      sendMessage(activeConversation.id, inputText.trim(), {
        category: contentType,
        images: attachedImages,
        recipientUserId: activeConversation.senderId,
        recipientName: activeConversation.senderName,
        title:
          contentType === 'personalized'
            ? `Personalized for ${activeConversation.senderName}`
            : undefined
      });

      // Reset selection and attachments after sending
      setContentType('flyer');
      setAttachedImages([]);
      setAttachError(null);
    } else {
      sendMessage(activeConversation.id, inputText.trim());
    }

    setInputText('');
    if (activeFilter !== 'all' || activeCategoryFilter !== 'all') {
      setActiveFilter('all');
      setActiveCategoryFilter('all');
    }
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#f0f4fa] relative select-none">
      {/* ========================================================================= */}
      {/* 1. COMPACT CONVERSATION HEADER                                            */}
      {/* ========================================================================= */}
      {currentUser?.role === 'Admin' ? (
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 py-2.5 shadow-2xs shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Back button on the left (applicable for Admin to return to all-marketers inbox) */}
              <button
                type="button"
                onClick={closeConversation}
                className="p-1 -ml-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50/80 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                title="Back to all marketers"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Profile photo approx 42-48px with active status */}
              <div className="relative shrink-0">
                <img
                  src={activeConversation.senderAvatar}
                  alt={activeConversation.senderName}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-200 shadow-2xs"
                  referrerPolicy="no-referrer"
                />
                {activeConversation.isOnline && (
                  <span
                    title="Active Now"
                    className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"
                  />
                )}
              </div>

              {/* Conversation Name & Role/Online status */}
              <div className="min-w-0">
                <h1 className="text-[15px] font-bold text-slate-900 leading-tight truncate tracking-tight">
                  {activeConversation.senderName}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <span className="font-normal">{activeConversation.senderRole || 'Marketer'}</span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active Now
                  </span>
                </div>
              </div>
            </div>

            {/* Notification and Overflow icons on the right */}
            <div className="flex items-center gap-1 shrink-0 relative">
              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className="p-2 rounded-xl text-blue-600 hover:text-blue-800 hover:bg-blue-50/80 flex items-center justify-center transition-colors relative cursor-pointer"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                className="p-2 rounded-xl text-blue-600 hover:text-blue-800 hover:bg-blue-50/80 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Menu"
                title="Options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {headerMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setHeaderMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1 z-50 text-xs font-medium text-slate-700 animate-in fade-in-50 zoom-in-95">
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderMenuOpen(false);
                        setActiveTab('profile');
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderMenuOpen(false);
                        setActiveTab('notifications');
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 cursor-pointer"
                    >
                      Alerts & Activity
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
      ) : (
        /* Marketer Role: Avatar/Name/Role/Status profile section completely removed, back button removed, compact header with controls */
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 py-1.5 shadow-2xs shrink-0">
          <div className="flex items-center justify-end gap-1 relative">
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="p-1.5 rounded-xl text-blue-600 hover:text-blue-800 hover:bg-blue-50/80 flex items-center justify-center transition-colors relative cursor-pointer"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
              className="p-1.5 rounded-xl text-blue-600 hover:text-blue-800 hover:bg-blue-50/80 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Menu"
              title="Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {headerMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setHeaderMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1 z-50 text-xs font-medium text-slate-700 animate-in fade-in-50 zoom-in-95">
                  <button
                    type="button"
                    onClick={() => {
                      setHeaderMenuOpen(false);
                      setActiveTab('profile');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeaderMenuOpen(false);
                      setActiveTab('notifications');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 cursor-pointer"
                  >
                    Alerts & Activity
                  </button>
                </div>
              </>
            )}
          </div>
        </header>
      )}

      {/* Status chips (tap to filter) + category — one compact bar */}
      <div className="mx-3 mt-2 mb-1.5 shrink-0 z-20">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-2 space-y-2">
          {imagePostingCounts && (
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  {
                    key: 'all' as PostingFilter,
                    label: 'All',
                    count: imagePostingCounts.total,
                    Icon: FileText,
                    on: 'bg-blue-600 text-white border-blue-600',
                    off: 'bg-blue-50 text-blue-700 border-blue-100'
                  },
                  {
                    key: 'posted' as PostingFilter,
                    label: 'Posted',
                    count: imagePostingCounts.posted,
                    Icon: CheckCircle2,
                    on: 'bg-emerald-600 text-white border-emerald-600',
                    off: 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  },
                  {
                    key: 'pending' as PostingFilter,
                    label: 'Pending',
                    count: imagePostingCounts.pending,
                    Icon: Clock,
                    on: 'bg-amber-500 text-white border-amber-500',
                    off: 'bg-amber-50 text-amber-800 border-amber-100'
                  },
                  {
                    key: 'not_posted' as PostingFilter,
                    label: 'Held',
                    count: imagePostingCounts.notPosted,
                    Icon: XCircle,
                    on: 'bg-rose-600 text-white border-rose-600',
                    off: 'bg-rose-50 text-rose-700 border-rose-100'
                  }
                ] as const
              ).map((chip) => {
                const active = activeFilter === chip.key;
                const Icon = chip.Icon;
                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setActiveFilter(chip.key)}
                    className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border px-1 py-1.5 transition-colors cursor-pointer ${
                      active ? chip.on : chip.off
                    }`}
                    title={chip.key === 'not_posted' ? 'Not posted' : chip.label}
                  >
                    <span className="flex items-center gap-0.5">
                      <Icon className="w-3 h-3 shrink-0" />
                      <span className="text-xs font-extrabold leading-none">{chip.count}</span>
                    </span>
                    <span className="text-[9px] font-bold leading-none opacity-90">{chip.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <div className="relative flex-1 min-w-0">
              <select
                id="message-category-filter"
                value={activeCategoryFilter}
                onChange={(e) => setActiveCategoryFilter(e.target.value as CategoryFilter)}
                className="w-full appearance-none bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-semibold pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 cursor-pointer outline-none"
              >
                <option value="all">All types</option>
                <option value="flyer">Flyer</option>
                <option value="personalized">Personalized</option>
                <option value="normal">Normal</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
            </div>

            <span className="text-[10px] font-semibold text-slate-400 shrink-0 tabular-nums">
              {filteredMessages.length}/{activeConversation.messages.length}
            </span>

            {(activeFilter !== 'all' || activeCategoryFilter !== 'all') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-8 h-8 rounded-xl text-blue-600 hover:bg-blue-50 border border-blue-100 flex items-center justify-center cursor-pointer shrink-0"
                title="Clear filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CHRONOLOGICAL CONVERSATION MESSAGE LIST                                */}
      {/* ========================================================================= */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 pt-2 pb-6 space-y-3.5 flex flex-col"
      >
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center my-auto select-none">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
              <Filter className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              No matching messages
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
              No messages match the selected filters in this conversation.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredMessages.map((message, index) => {
            const isTargeted = highlightedId === message.id;

            // Date Separator: pill divider matching reference
            const currentDate = message.date || 'Yesterday';
            const prevDate = index > 0 ? (filteredMessages[index - 1].date || 'Yesterday') : null;
            const showDateDivider = index === 0 || currentDate !== prevDate;

            return (
              <React.Fragment key={message.id}>
                {/* Date Divider (centered pill) */}
                {showDateDivider && (
                  <div className="flex justify-center my-1 select-none">
                    <span className="text-[11px] font-medium text-slate-500 bg-blue-50/80 border border-blue-100/70 px-3.5 py-0.5 rounded-full shadow-2xs">
                      {currentDate}
                    </span>
                  </div>
                )}

                {/* Message Item */}
                <div
                  id={`message-${message.id}`}
                  className="w-full transition-all duration-300"
                >
                  <ContentMessageCard
                    message={message}
                    isHighlighted={isTargeted}
                  />
                </div>
              </React.Fragment>
            );
          })
        )}

        <div ref={messagesEndRef} className="h-2 shrink-0" />
      </div>

      {/* ========================================================================= */}
      {/* 5. FIXED MESSAGE COMPOSER                                                 */}
      {/* ========================================================================= */}
      <footer className="sticky bottom-0 bg-white border-t border-slate-200/80 px-2.5 sm:px-3 py-2 z-20 shrink-0">
        <div className="max-w-3xl mx-auto">
          {currentUser?.role === 'Admin' ? (
            <div className="space-y-1.5">
              {/* Attachment preview (only when needed) */}
              {attachedImages.length > 0 && (
                <div className="flex items-center gap-2 px-0.5 overflow-x-auto">
                  {attachedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0"
                    >
                      <img
                        src={img}
                        alt={`Attachment ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full flex items-center justify-center cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  <span className="text-[10px] font-semibold text-blue-700 shrink-0">
                    {attachedImages.length}/3
                  </span>
                </div>
              )}

              {attachError && (
                <p className="text-[11px] text-rose-600 font-medium px-0.5">{attachError}</p>
              )}

              {/* One-line composer: Type · Message · Emoji · Attach · Send */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-1.5 bg-[#f8fafc] border border-slate-200/90 rounded-full pl-1.5 pr-1.5 py-1 shadow-2xs"
              >
                <div className="relative shrink-0">
                  <select
                    id="admin-composer-content-type"
                    value={contentType}
                    onChange={(e) =>
                      setContentType(e.target.value as 'flyer' | 'personalized' | 'normal')
                    }
                    aria-label="Content type"
                    title="Content type"
                    className="appearance-none max-w-[7.5rem] text-[11px] font-bold bg-white text-slate-800 rounded-full pl-2.5 pr-6 py-1.5 border border-slate-200 cursor-pointer outline-none hover:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="flyer">Flyer</option>
                    <option value="personalized">Personalized</option>
                    <option value="normal">Normal</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    contentType === 'flyer'
                      ? 'Type flyer message...'
                      : contentType === 'personalized'
                        ? 'Type personalized message...'
                        : 'Type a message...'
                  }
                  className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none px-1 py-1.5"
                />

                <div className="relative shrink-0" ref={emojiPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                      showEmojiPicker
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-500 hover:text-blue-600 hover:bg-white'
                    }`}
                    title="Insert emoji"
                    aria-label="Insert emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute right-0 bottom-full mb-2 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 w-60 animate-in fade-in-50 zoom-in-95">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Insert Emoji
                      </div>
                      <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleInsertEmoji(emoji)}
                            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-base cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <label
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shrink-0 ${
                    attachedImages.length >= 3
                      ? 'opacity-40 cursor-not-allowed text-slate-400'
                      : 'text-slate-500 hover:text-blue-600 hover:bg-white'
                  }`}
                  title={attachedImages.length >= 3 ? 'Max 3 images' : 'Attach image'}
                >
                  <ImagePlus className="w-4 h-4" />
                  {attachedImages.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {attachedImages.length}
                    </span>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={attachedImages.length >= 3}
                    onChange={handleFileAttach}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={!inputText.trim() && attachedImages.length === 0}
                  className="w-8 h-8 rounded-full bg-[#0066f5] hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
                  aria-label="Send"
                >
                  <Send className="w-3.5 h-3.5 text-white -mr-0.5" />
                </button>
              </form>
            </div>
          ) : (
            /* Marketer text-only composer: [ Type a message... ] [ Send ] */
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <div className="flex-1 bg-[#f0f4fa] border border-slate-200/80 rounded-full px-4 py-2 flex items-center transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-9 h-9 rounded-full bg-[#0066f5] hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-all active:scale-95"
                aria-label="Send"
              >
                <Send className="w-4 h-4 text-white -mr-0.5" />
              </button>
            </form>
          )}
        </div>
      </footer>
    </div>
  );
};
