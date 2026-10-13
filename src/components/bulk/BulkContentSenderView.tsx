import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  Layers,
  UserCheck,
  Users,
  ImagePlus,
  X,
  Smile,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  Info,
  Clock,
  Eye
} from 'lucide-react';
import { ContentCategory } from '../../types';

// Common business and marketing emojis
const MARKETING_EMOJIS = [
  '🚀', '📢', '🎯', '🔥', '✨', '💼', '📈', '💡', '📅', '🏷️',
  '📦', '👏', '👍', '🎉', '⭐', '💰', '📊', '⚡', '📝', '📣',
  '🤝', '🏆', '🕒', '🎨', '💬', '🔔', '📌', '🌟', '💯', '📱',
  '🌐', '🛍️', '💎', '⏳', '✅', '❤️'
];

export const BulkContentSenderView: React.FC = () => {
  const {
    currentUser,
    conversations,
    sendBulkMessage,
    setActiveTab,
    showToast
  } = useApp();

  // Role Protection
  if (currentUser?.role !== 'Admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-3 shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-slate-800 mb-1">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-xs mb-4">
          Only corporate administrators have permission to access the Bulk Content Sender.
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

  // State
  const [contentType, setContentType] = useState<ContentCategory>('flyer');
  const [isAllMarketers, setIsAllMarketers] = useState<boolean>(true);
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [marketerSearch, setMarketerSearch] = useState<string>('');

  const [title, setTitle] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Eligible marketers list derived directly from project conversations
  const marketerList = useMemo(() => {
    return conversations.map((c) => ({
      conversationId: c.id,
      marketerId: c.senderId,
      name: c.senderName,
      avatar: c.senderAvatar,
      role: c.senderRole || 'Marketer',
      company: c.senderCompany || 'Marketing Agency',
      isOnline: c.isOnline
    }));
  }, [conversations]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered marketers for search in dropdown
  const filteredMarketers = useMemo(() => {
    if (!marketerSearch.trim()) return marketerList;
    const q = marketerSearch.toLowerCase().trim();
    return marketerList.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q)
    );
  }, [marketerList, marketerSearch]);

  // Recipient resolution
  const resolvedRecipients = useMemo(() => {
    if (isAllMarketers) {
      return marketerList;
    }
    return marketerList.filter((m) => selectedConversationIds.includes(m.conversationId));
  }, [isAllMarketers, selectedConversationIds, marketerList]);

  // Dropdown toggle handlers
  const handleSelectAll = () => {
    setIsAllMarketers(true);
    setSelectedConversationIds([]);
  };

  const handleClearSelection = () => {
    setIsAllMarketers(false);
    setSelectedConversationIds([]);
  };

  const handleToggleMarketer = (convId: string) => {
    if (isAllMarketers) {
      // Switching from All Marketers to specific marketer
      setIsAllMarketers(false);
      setSelectedConversationIds([convId]);
    } else {
      setSelectedConversationIds((prev) => {
        if (prev.includes(convId)) {
          return prev.filter((id) => id !== convId);
        } else {
          const next = [...prev, convId];
          // If all individual marketers are selected, switch to All Marketers mode
          if (next.length === marketerList.length) {
            setIsAllMarketers(true);
            return [];
          }
          return next;
        }
      });
    }
  };

  const handleRemoveChip = (convId: string) => {
    if (isAllMarketers) {
      // Switch to specific selection excluding this marketer
      setIsAllMarketers(false);
      setSelectedConversationIds(
        marketerList.filter((m) => m.conversationId !== convId).map((m) => m.conversationId)
      );
    } else {
      setSelectedConversationIds((prev) => prev.filter((id) => id !== convId));
    }
  };

  // Insert emoji at cursor position
  const handleInsertEmoji = (emoji: string) => {
    if (!textareaRef.current) {
      setMessageText((prev) => prev + emoji);
      setShowEmojiPicker(false);
      return;
    }

    const start = textareaRef.current.selectionStart || 0;
    const end = textareaRef.current.selectionEnd || 0;
    const nextText =
      messageText.substring(0, start) + emoji + messageText.substring(end);
    setMessageText(nextText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + emoji.length, start + emoji.length);
      }
    }, 10);
    setShowEmojiPicker(false);
  };

  // Image attachment handler (max 3 images)
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAttachError(null);

    const fileList = Array.from(files);
    if (attachedImages.length + fileList.length > 3) {
      setAttachError('Maximum 3 image attachments allowed per campaign.');
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
        setAttachError('Each image file must be under 8MB.');
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

  const handleRemoveImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, idx) => idx !== index));
    setAttachError(null);
  };

  // Clear draft
  const handleClearDraft = () => {
    setTitle('');
    setMessageText('');
    setAttachedImages([]);
    setAttachError(null);
    setIsAllMarketers(true);
    setSelectedConversationIds([]);
    showToast('Draft cleared', 'info');
  };

  // Validation
  const hasContent = Boolean(
    title.trim() || messageText.trim() || attachedImages.length > 0
  );
  const hasRecipients = resolvedRecipients.length > 0;
  const canSend = hasContent && hasRecipients && !isSending;

  // Send content handler
  const handleSend = () => {
    if (!canSend) return;
    setIsSending(true);

    const recipientIds = isAllMarketers
      ? ['all']
      : selectedConversationIds;

    const result = sendBulkMessage({
      category: contentType,
      title: title.trim(),
      text: messageText.trim(),
      images: attachedImages,
      recipientConversationIds: recipientIds
    });

    if (result.success) {
      // Clear draft after successful delivery
      setTitle('');
      setMessageText('');
      setAttachedImages([]);
      setAttachError(null);
      setIsAllMarketers(true);
      setSelectedConversationIds([]);
    }

    setIsSending(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f4f7fb] overflow-y-auto">
      <div className="max-w-2xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* Page Banner / Title Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200">
                  Admin Tool
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Multi-Recipient Delivery
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Bulk Content Sender
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Send campaign flyers or targeted personalized instructions to multiple marketers simultaneously.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('conversations')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              View Inboxes
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. CONTENT CATEGORY SELECTOR (FLYER vs PERSONALIZED)                      */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Content Type</span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Flyer Option Card */}
            <div
              onClick={() => setContentType('flyer')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                contentType === 'flyer'
                  ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-400/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Flyer</span>
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      contentType === 'flyer'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {contentType === 'flyer' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
                <h3 className="text-xs font-bold text-slate-900 mb-0.5">
                  Campaign Flyer Broadcast
                </h3>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Marketing creatives for cross-channel rollout. Marketers post and update status independently.
                </p>
              </div>
            </div>

            {/* Personalized Option Card */}
            <div
              onClick={() => setContentType('personalized')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                contentType === 'personalized'
                  ? 'border-purple-500 bg-purple-50/50 shadow-xs ring-1 ring-purple-400/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wide bg-purple-100 text-purple-700 border border-purple-200">
                    <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Personalized</span>
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      contentType === 'personalized'
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {contentType === 'personalized' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
                <h3 className="text-xs font-bold text-slate-900 mb-0.5">
                  Personalized Deliverable
                </h3>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Direct ambassador material, targeted instructions, or bespoke copy for designated marketers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. RECIPIENT MULTI-SELECTION DROPDOWN                                     */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Send To (Recipients)</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className={`text-[11px] font-bold transition-colors cursor-pointer ${
                  isAllMarketers ? 'text-blue-700' : 'text-slate-500 hover:text-blue-600'
                }`}
              >
                Select All
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-[11px] font-medium text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Trigger Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100/70 text-left transition-colors cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800 truncate">
                  {isAllMarketers
                    ? `All Marketers (${marketerList.length} total)`
                    : resolvedRecipients.length === 0
                    ? 'Select recipients...'
                    : `${resolvedRecipients.length} marketer${resolvedRecipients.length > 1 ? 's' : ''} selected`}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Popover */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white rounded-xl shadow-xl border border-slate-200/90 py-2 text-xs overflow-hidden animate-in fade-in-50 zoom-in-95">
                {/* Search Bar inside dropdown */}
                <div className="px-3 pb-2 border-b border-slate-100">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={marketerSearch}
                      onChange={(e) => setMarketerSearch(e.target.value)}
                      placeholder="Search marketer by name or role..."
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </div>

                {/* Option 1: All Marketers */}
                <div className="p-1 border-b border-slate-100">
                  <div
                    onClick={handleSelectAll}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isAllMarketers
                        ? 'bg-blue-50 text-blue-800 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block">All Marketers</span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Broadcast to all {marketerList.length} active team members
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isAllMarketers
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isAllMarketers && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                {/* Individual Marketers List */}
                <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50">
                  {filteredMarketers.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs">
                      No marketers match "{marketerSearch}".
                    </div>
                  ) : (
                    filteredMarketers.map((m) => {
                      const isSelected =
                        isAllMarketers || selectedConversationIds.includes(m.conversationId);
                      return (
                        <div
                          key={m.conversationId}
                          onClick={() => handleToggleMarketer(m.conversationId)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected && !isAllMarketers
                              ? 'bg-purple-50 text-purple-900 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={m.avatar}
                                alt={m.name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              {m.isOnline && (
                                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold block truncate">{m.name}</span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {m.role} • {m.company}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ml-2 ${
                              isSelected
                                ? isAllMarketers
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-purple-600 bg-purple-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Selected Recipient Chips / Summary */}
          {isAllMarketers ? (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900">
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-bold">All Marketers selected:</span>{' '}
                <span className="text-blue-700">
                  Every eligible marketer ({marketerList.length} members) will receive this {contentType}.
                </span>
              </div>
            </div>
          ) : (
            <div>
              {selectedConversationIds.length === 0 ? (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Please select at least one marketer to deliver this content to.</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {resolvedRecipients.map((m) => (
                    <span
                      key={m.conversationId}
                      className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-800 shadow-3xs group"
                    >
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-4 h-4 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="truncate max-w-[140px]">{m.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveChip(m.conversationId);
                        }}
                        className="w-3.5 h-3.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer ml-0.5"
                        title={`Remove ${m.name}`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. CONTENT COMPOSER                                                       */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Content Composer
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              Formatting & Attachments
            </span>
          </div>

          {/* Optional Title Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Content Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title... (e.g. Autumn Horizon Launch, VIP Promo)"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Multiline Message Text Field */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Message or Instructions
              </label>
              <div className="relative" ref={emojiPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                  title="Insert emoji"
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>Add Emoji</span>
                </button>

                {/* Compact Emoji Picker Popover */}
                {showEmojiPicker && (
                  <div className="absolute right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 w-64 animate-in fade-in-50 zoom-in-95">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Marketing & Business Emojis
                    </div>
                    <div className="grid grid-cols-6 gap-1.5 max-h-44 overflow-y-auto">
                      {MARKETING_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleInsertEmoji(emoji)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-lg transition-transform active:scale-90 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <textarea
              ref={textareaRef}
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write your message or instructions... Multiline text and line breaks are preserved."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y min-h-[100px] max-h-[220px]"
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Attachments (Max 3 Images)
                </span>
                <span className="text-[10.5px] text-slate-400">
                  {attachedImages.length}/3 attached • JPEG, PNG, WebP up to 8MB each
                </span>
              </div>

              <label
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  attachedImages.length >= 3
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                }`}
                title="Attach flyers or creatives"
              >
                <ImagePlus className="w-4 h-4 text-blue-600" />
                <span>Attach Images</span>
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
            </div>

            {/* Attachment Previews */}
            {attachedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
                {attachedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-full aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs group"
                  >
                    <img
                      src={img}
                      alt={`Attached creative ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold">
                      Flyer {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Validation Error Banner */}
            {attachError && (
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
                {attachError}
              </div>
            )}
          </div>

          {/* Live Preview Card */}
          {hasContent && (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Eye className="w-3 h-3 text-slate-400" />
                <span>Recipient Card Preview</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {contentType === 'flyer' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase bg-blue-100 text-blue-700 border border-blue-200">
                      <Layers className="w-2.5 h-2.5 text-blue-600" />
                      <span>FLYER</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase bg-purple-100 text-purple-700 border border-purple-200">
                      <UserCheck className="w-2.5 h-2.5 text-purple-600" />
                      <span>PERSONALIZED</span>
                    </span>
                  )}
                  <span className="text-[10.5px] text-slate-500 font-medium">
                    {isAllMarketers
                      ? 'Shared with all marketers'
                      : `To: ${resolvedRecipients.map((r) => r.name).join(', ')}`}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900">
                  {title.trim() || (contentType === 'flyer' ? 'Flyer Campaign' : 'Personalized Deliverable')}
                </div>

                {messageText.trim() && (
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed line-clamp-3">
                    {messageText.trim()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClearDraft}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Draft</span>
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSending
                  ? 'Delivering...'
                  : isAllMarketers
                  ? `Broadcast ${contentType === 'flyer' ? 'Flyer' : 'Content'} to All (${marketerList.length})`
                  : resolvedRecipients.length > 0
                  ? `Send to ${resolvedRecipients.length} Marketer${resolvedRecipients.length > 1 ? 's' : ''}`
                  : 'Send to Selected Marketers'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
