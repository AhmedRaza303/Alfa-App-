import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  Conversation,
  NotificationItem,
  MessageAction,
  ActiveTab,
  Message,
  BulkSendOptions,
  ScheduleBulkSendOptions,
  ScheduledSend,
  AppLanguage,
  Lead,
  LeadSubmissionStatus,
  FlyerCategory,
  ReactionEmoji,
  MessageReaction,
  TourPage,
  TOUR_PAGES,
  LanguageContentRequest,
  RequestableContentLanguage,
  ChatPostingFilter,
  ChatCategoryFilter
} from '../types';
import { isLeadLocked, normalizeLead } from '../utils/leads';
import {
  INITIAL_USERS,
  INITIAL_ACTIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_LEADS
} from '../data/mockData';
import { resolveImageUrl, ONLINE_FLYER_URLS } from '../utils/imageAssets';
import {
  compactConversationsForStorage,
  compactMediaUrl,
  safeSetLocalStorage
} from '../utils/mediaStorage';
import { getTranslation, TranslationDict } from '../utils/i18n';
import {
  buildReferralCode,
  ensureAllReferralCodes,
  findUserByReferralCode,
  getReferralLink,
  readRefFromUrl,
  persistPendingRef,
  loadPendingRef,
  clearPendingRef
} from '../utils/referrals';
import {
  buildNotification,
  getReferrerUplineIds,
  normalizeNotification,
  sortNotifications
} from '../utils/notifications';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ImageViewerState {
  isOpen: boolean;
  images: string[];
  activeIndex: number;
  title?: string;
}

export interface SendMessageOptions {
  category?: 'flyer' | 'personalized' | 'normal';
  title?: string;
  images?: string[];
  videos?: string[];
  recipientUserId?: string;
  recipientName?: string;
  /** Language of this deliverable (English or Spanish) */
  contentLanguage?: RequestableContentLanguage;
}

interface AppContextType {
  // Auth & User
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  authView: 'login' | 'signup' | 'app';
  setAuthView: (view: 'login' | 'signup' | 'app') => void;
  signupSuccessMessage: string | null;
  setSignupSuccessMessage: (msg: string | null) => void;
  registeredEmail: string;
  login: (email: string, password?: string) => { success: boolean; message?: string; approvalStatus?: string; user?: User };
  signup: (newUser: Omit<User, 'id'>) => boolean;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
  pendingReferralCode: string | null;
  setPendingReferralCode: (code: string | null) => void;
  getReferralLinkForUser: (userId?: string) => string | null;
  findReferrerByCode: (code: string) => User | undefined;
  approveMarketer: (userId: string) => void;
  rejectMarketer: (userId: string, reason?: string) => void;
  completeTour: () => void;
  completePageTour: (page: TourPage) => void;
  /** Clear a page's completion and bump token so AppShell reopens that page tour */
  reopenPageTour: (page: TourPage) => void;
  tourReplayToken: number;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: TranslationDict;

  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeConversationId: string | null;
  targetMessageId: string | null;
  setTargetMessageId: (id: string | null) => void;
  openConversation: (id: string, targetMessageId?: string) => void;
  closeConversation: () => void;
  /** Posting-status chip on Chats (also set when opening from Stats) */
  chatPostingFilter: ChatPostingFilter;
  setChatPostingFilter: (filter: ChatPostingFilter) => void;
  /** Category dropdown on Chats (also set when opening from Stats Content Distribution) */
  chatCategoryFilter: ChatCategoryFilter;
  setChatCategoryFilter: (filter: ChatCategoryFilter) => void;
  /** Bumps when Stats opens Chats so detail view can reset media/search */
  chatFilterNavToken: number;
  openChatsWithPostingFilter: (filter: ChatPostingFilter) => void;
  openChatsWithCategoryFilter: (filter: ChatCategoryFilter) => void;
  /** Accident-type filter on Leads (set when opening from Stats breakdown) */
  leadsAccidentTypeFilter: FlyerCategory | 'all';
  setLeadsAccidentTypeFilter: (filter: FlyerCategory | 'all') => void;
  openLeadsWithAccidentType: (type: FlyerCategory | 'all') => void;

  // Conversations & Actions
  conversations: Conversation[];
  activeConversation: Conversation | null;
  getMessageAction: (messageId: string) => MessageAction | undefined;
  markAsPosted: (conversationId: string, messageId: string) => void;
  markAsNotPosted: (conversationId: string, messageId: string, reason: string, comments: string) => void;
  sendMessage: (conversationId: string, text: string, options?: SendMessageOptions) => void;
  sendBulkMessage: (options: BulkSendOptions) => { success: boolean; deliveredCount: number; message?: string };
  scheduledSends: ScheduledSend[];
  scheduleBulkSend: (options: ScheduleBulkSendOptions) => { success: boolean; message?: string };
  cancelScheduledSend: (id: string) => void;
  sendScheduledNow: (id: string) => { success: boolean; message?: string };
  toggleReaction: (conversationId: string, messageId: string, emoji: ReactionEmoji) => void;
  markMessagesAsRead: (conversationId: string) => void;
  pendingActionsCount: number;
  pendingMarketerRequestsCount: number;
  upcomingScheduledCount: number;

  // Leads
  leads: Lead[];
  addLead: (data: {
    fullName: string;
    phone: string;
    email: string;
    accidentType: FlyerCategory;
    notes: string;
  }) => void;
  updateLead: (
    leadId: string,
    data: {
      fullName: string;
      phone: string;
      email: string;
      accidentType: FlyerCategory;
      notes: string;
    }
  ) => void;
  deleteLead: (leadId: string) => void;
  updateLeadSubmissionStatus: (leadId: string, status: LeadSubmissionStatus) => void;

  // Modal for Not Posted
  notPostedModal: {
    isOpen: boolean;
    conversationId: string | null;
    messageId: string | null;
    campaignName?: string;
  };
  openNotPostedModal: (conversationId: string, messageId: string, campaignName?: string) => void;
  closeNotPostedModal: () => void;

  // Need Another Language request
  languageRequestModal: {
    isOpen: boolean;
    conversationId: string | null;
    messageId: string | null;
    campaignName?: string;
    contentLanguage?: RequestableContentLanguage;
  };
  openLanguageRequestModal: (
    conversationId: string,
    messageId: string,
    campaignName?: string,
    contentLanguage?: RequestableContentLanguage
  ) => void;
  closeLanguageRequestModal: () => void;
  submitLanguageRequest: (payload: {
    conversationId: string;
    messageId: string;
    campaignName?: string;
    sourceLanguage: RequestableContentLanguage;
    requestedLanguage: RequestableContentLanguage;
    requestedLanguageLabel: string;
  }) => { success: boolean; message?: string };
  languageRequests: LanguageContentRequest[];
  getLanguageRequestForMessage: (messageId: string) => LanguageContentRequest | undefined;

  // Image Lightbox / Viewer
  imageViewer: ImageViewerState;
  openImageViewer: (images: string[], index?: number, title?: string) => void;
  closeImageViewer: () => void;
  nextImage: () => void;
  prevImage: () => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Toast
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Registered users state
  const [users, setUsers] = useState<User[]>(() => {
    const mergeReferralSeed = (list: User[]): User[] => {
      const byEmail = new Map(list.map((u) => [u.email.toLowerCase(), u]));
      const merged = list.map((u) => {
        const seed = INITIAL_USERS.find(
          (s) => s.id === u.id || s.email.toLowerCase() === u.email.toLowerCase()
        );
        if (!seed) return u;
        const completedTourPages =
          u.completedTourPages ??
          seed.completedTourPages ??
          (u.hasCompletedTour || seed.hasCompletedTour ? [...TOUR_PAGES] : []);
        return {
          ...u,
          referralCode: u.referralCode || seed.referralCode,
          referredByUserId: u.referredByUserId ?? seed.referredByUserId,
          isTourDemo: seed.isTourDemo ?? u.isTourDemo,
          completedTourPages: seed.isTourDemo ? [] : completedTourPages
        };
      });
      for (const seed of INITIAL_USERS) {
        if (!byEmail.has(seed.email.toLowerCase())) {
          merged.push(seed);
          byEmail.set(seed.email.toLowerCase(), seed);
        }
      }
      return ensureAllReferralCodes(merged);
    };

    const saved =
      localStorage.getItem('marketpulse_users_v4') ||
      localStorage.getItem('marketpulse_users_v3');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const adminFound = parsed.some((u) => u.email.toLowerCase() === 'admin@marketingapp.com');
        const marketerFound = parsed.some((u) => u.email.toLowerCase() === 'marketer@marketingapp.com');
        // Merge seed marketers (incl. new referral mock users) into localStorage list
        if (adminFound && marketerFound) return mergeReferralSeed(parsed);
      } catch {
        // Fallback to INITIAL_USERS
      }
    }
    return ensureAllReferralCodes(INITIAL_USERS);
  });

  const [pendingReferralCode, setPendingReferralCodeState] = useState<string | null>(() =>
    loadPendingRef()
  );

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem('marketpulse_current_uid_v3');
    return saved || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('marketpulse_auth_v3');
    return saved ? JSON.parse(saved) : false;
  });

  const [authView, setAuthView] = useState<'login' | 'signup' | 'app'>('login');
  const [signupSuccessMessage, setSignupSuccessMessage] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('conversations');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [targetMessageId, setTargetMessageId] = useState<string | null>(null);
  const [chatPostingFilter, setChatPostingFilter] = useState<ChatPostingFilter>('all');
  const [chatCategoryFilter, setChatCategoryFilter] = useState<ChatCategoryFilter>('all');
  const [chatFilterNavToken, setChatFilterNavToken] = useState(0);
  const [leadsAccidentTypeFilter, setLeadsAccidentTypeFilter] = useState<
    FlyerCategory | 'all'
  >('all');

  // Capture ?ref=CODE from URL → open signup with that referrer
  useEffect(() => {
    const fromUrl = readRefFromUrl();
    if (!fromUrl) return;
    const clean = fromUrl.trim().toUpperCase();
    persistPendingRef(clean);
    setPendingReferralCodeState(clean);
    setAuthView('signup');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch {
      // ignore
    }
  }, []);

  const setPendingReferralCode = useCallback((code: string | null) => {
    if (!code) {
      clearPendingRef();
      setPendingReferralCodeState(null);
      return;
    }
    const clean = code.trim().toUpperCase();
    persistPendingRef(clean);
    setPendingReferralCodeState(clean);
  }, []);

  const findReferrerByCode = useCallback(
    (code: string) => findUserByReferralCode(users, code),
    [users]
  );

  const getReferralLinkForUser = useCallback(
    (userId?: string) => {
      const id = userId || currentUserId;
      if (!id) return null;
      const user = users.find((u) => u.id === id);
      if (!user?.referralCode) return null;
      return getReferralLink(user.referralCode);
    },
    [users, currentUserId]
  );

  // Message Actions state (Keyed by `${userId}_${messageId}`)
  const [actionsMap, setActionsMap] = useState<Record<string, MessageAction>>(() => {
    const saved = localStorage.getItem('marketpulse_actions_v4');
    if (!saved) return INITIAL_ACTIONS;
    try {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_ACTIONS, ...parsed };
    } catch {
      return INITIAL_ACTIONS;
    }
  });

  // Conversations state (Keyed by userId)
  const [conversationsMap, setConversationsMap] = useState<Record<string, Conversation[]>>(() => {
    const normalizeConv = (convList: Conversation[]): Conversation[] => {
      return convList.map((c) => ({
        ...c,
        messages: c.messages.map((m) => ({
          ...m,
          images: m.images
            ? m.images.map((img) => resolveImageUrl(compactMediaUrl(img, 'image')))
            : undefined,
          imageUrl: m.imageUrl
            ? resolveImageUrl(compactMediaUrl(m.imageUrl, 'image'))
            : undefined,
          videos: m.videos
            ? m.videos.filter(Boolean).map((vid) => compactMediaUrl(vid, 'video'))
            : undefined
        }))
      }));
    };

    const saved = localStorage.getItem('marketpulse_conversations_v4');
    if (!saved) return INITIAL_CONVERSATIONS;
    try {
      const parsed = JSON.parse(saved);
      const merged: Record<string, Conversation[]> = { ...INITIAL_CONVERSATIONS };
      for (const uid of Object.keys(INITIAL_CONVERSATIONS)) {
        const existing = parsed[uid] || [];
        const initList = INITIAL_CONVERSATIONS[uid] || [];
        const existingIds = new Set(existing.map((c: Conversation) => c.id));
        const missing = initList.filter((c) => !existingIds.has(c.id));
        merged[uid] = normalizeConv([...existing, ...missing]);
      }
      // Immediately rewrite compacted data so quota is freed
      safeSetLocalStorage(
        'marketpulse_conversations_v4',
        JSON.stringify(compactConversationsForStorage(merged))
      );
      return merged;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  // Notifications state (Keyed by userId)
  const [notificationsMap, setNotificationsMap] = useState<Record<string, NotificationItem[]>>(() => {
    const normalizeMap = (map: Record<string, NotificationItem[]>) => {
      const next: Record<string, NotificationItem[]> = {};
      for (const [uid, list] of Object.entries(map)) {
        next[uid] = (list || []).map(normalizeNotification);
      }
      return next;
    };

    const saved = localStorage.getItem('marketpulse_notifications_v4');
    if (!saved) return normalizeMap(INITIAL_NOTIFICATIONS);
    try {
      const parsed = JSON.parse(saved);
      const merged: Record<string, NotificationItem[]> = { ...INITIAL_NOTIFICATIONS };
      for (const uid of Object.keys(INITIAL_NOTIFICATIONS)) {
        const existing = parsed[uid] || [];
        const initList = INITIAL_NOTIFICATIONS[uid] || [];
        const existingIds = new Set(existing.map((n: NotificationItem) => n.id));
        const missing = initList.filter((n) => !existingIds.has(n.id));
        merged[uid] = [...existing, ...missing];
      }
      // Keep any extra user keys from storage
      for (const uid of Object.keys(parsed)) {
        if (!merged[uid]) merged[uid] = parsed[uid];
      }
      return normalizeMap(merged);
    } catch {
      return normalizeMap(INITIAL_NOTIFICATIONS);
    }
  });

  // Leads
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('marketpulse_leads_v1');
    if (!saved) return INITIAL_LEADS.map(normalizeLead);
    try {
      const parsed: Lead[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_LEADS.map(normalizeLead);
      const normalized = parsed.map(normalizeLead);
      const ids = new Set(normalized.map((l) => l.id));
      const missing = INITIAL_LEADS.filter((l) => !ids.has(l.id)).map(normalizeLead);
      return [...normalized, ...missing];
    } catch {
      return INITIAL_LEADS.map(normalizeLead);
    }
  });

  // Content calendar — scheduled bulk sends
  const [scheduledSends, setScheduledSends] = useState<ScheduledSend[]>(() => {
    const saved = localStorage.getItem('marketpulse_scheduled_sends_v1');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Modal for Not Posted
  const [notPostedModal, setNotPostedModal] = useState<{
    isOpen: boolean;
    conversationId: string | null;
    messageId: string | null;
    campaignName?: string;
  }>({
    isOpen: false,
    conversationId: null,
    messageId: null
  });

  const [languageRequestModal, setLanguageRequestModal] = useState<{
    isOpen: boolean;
    conversationId: string | null;
    messageId: string | null;
    campaignName?: string;
    contentLanguage?: RequestableContentLanguage;
  }>({
    isOpen: false,
    conversationId: null,
    messageId: null,
    contentLanguage: 'en'
  });

  const [languageRequests, setLanguageRequests] = useState<LanguageContentRequest[]>(() => {
    const saved = localStorage.getItem('marketpulse_language_requests_v1');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((r: LanguageContentRequest) => ({
        ...r,
        sourceLanguage: r.sourceLanguage || 'en'
      }));
    } catch {
      return [];
    }
  });

  // Image Viewer state
  const [imageViewer, setImageViewer] = useState<ImageViewerState>({
    isOpen: false,
    images: [],
    activeIndex: 0
  });

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('marketpulse_users_v4', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('marketpulse_current_uid_v4', currentUserId);
    } else {
      localStorage.removeItem('marketpulse_current_uid_v4');
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('marketpulse_auth_v4', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('marketpulse_actions_v4', JSON.stringify(actionsMap));
  }, [actionsMap]);

  useEffect(() => {
    // Never persist base64/blob media — they blow past localStorage quota
    const compact = compactConversationsForStorage(conversationsMap);
    const ok = safeSetLocalStorage(
      'marketpulse_conversations_v4',
      JSON.stringify(compact)
    );
    if (!ok) {
      console.warn('Conversation storage skipped: browser quota exceeded');
    }
  }, [conversationsMap]);

  useEffect(() => {
    localStorage.setItem('marketpulse_notifications_v4', JSON.stringify(notificationsMap));
  }, [notificationsMap]);

  useEffect(() => {
    localStorage.setItem('marketpulse_leads_v1', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('marketpulse_language_requests_v1', JSON.stringify(languageRequests));
  }, [languageRequests]);

  useEffect(() => {
    const compact = scheduledSends.map((s) => ({
      ...s,
      images: s.images.map((img) => compactMediaUrl(img, 'image')),
      videos: s.videos?.map((vid) => compactMediaUrl(vid, 'video'))
    }));
    const ok = safeSetLocalStorage('marketpulse_scheduled_sends_v1', JSON.stringify(compact));
    if (!ok) {
      console.warn('Scheduled sends storage skipped: browser quota exceeded');
    }
  }, [scheduledSends]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3500);
  }, []);

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return users.find((u) => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  // Force-clear session if a marketer is not approved (no app activity allowed)
  useEffect(() => {
    if (
      isAuthenticated &&
      currentUser?.role === 'Marketer' &&
      currentUser.approvalStatus !== 'approved'
    ) {
      setIsAuthenticated(false);
      setCurrentUserId(null);
      setAuthView('login');
      setActiveConversationId(null);
      setActiveTab('conversations');
    }
  }, [isAuthenticated, currentUser]);

  const conversations = useMemo(() => {
    if (!currentUserId) return [];
    return conversationsMap[currentUserId] || [];
  }, [conversationsMap, currentUserId]);

  const notifications = useMemo(() => {
    if (!currentUserId) return [];
    return sortNotifications(notificationsMap[currentUserId] || []);
  }, [notificationsMap, currentUserId]);

  const pushNotification = useCallback(
    (
      userId: string,
      partial: Parameters<typeof buildNotification>[0]
    ) => {
      const notif = buildNotification({ ...partial, userId });
      setNotificationsMap((prev) => ({
        ...prev,
        [userId]: [notif, ...(prev[userId] || [])]
      }));
      return notif;
    },
    []
  );

  const activeConversation = useMemo(() => {
    // If Marketer role, ALWAYS restrict to their own assigned conversation
    if (currentUser?.role === 'Marketer') {
      const assigned = conversations[0] || null;
      return assigned;
    }

    if (activeConversationId) {
      const found = conversations.find((c) => c.id === activeConversationId);
      if (found) return found;
    }
    return null;
  }, [currentUser, conversations, activeConversationId]);

  const getMessageAction = useCallback(
    (messageId: string): MessageAction | undefined => {
      if (!currentUserId) return undefined;
      const key = `${currentUserId}_${messageId}`;
      return actionsMap[key];
    },
    [actionsMap, currentUserId]
  );

  // Pending actions count for current user
  const pendingActionsCount = useMemo(() => {
    if (!currentUserId) return 0;
    let count = 0;
    for (const conv of conversations) {
      for (const msg of conv.messages) {
        if (msg.isPostable) {
          const action = actionsMap[`${currentUserId}_${msg.id}`];
          if (!action || action.status === 'pending') {
            count++;
          }
        }
      }
    }
    return count;
  }, [conversations, actionsMap, currentUserId]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const pendingMarketerRequestsCount = useMemo(() => {
    return users.filter((u) => u.role === 'Marketer' && u.approvalStatus === 'pending').length;
  }, [users]);

  // Actions
  const markAsPosted = useCallback(
    (conversationId: string, messageId: string) => {
      if (!currentUserId) return;
      const key = `${currentUserId}_${messageId}`;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newAction: MessageAction = {
        id: `act-${Date.now()}`,
        userId: currentUserId,
        conversationId,
        messageId,
        status: 'posted',
        postedAt: `Today at ${timeStr}`,
        timestamp: `Today at ${timeStr}`
      };

      setActionsMap((prev) => ({
        ...prev,
        [key]: newAction
      }));

      // Add user-specific notification
      const conv = conversationsMap[currentUserId]?.find((c) => c.id === conversationId);
      const msg = conv?.messages.find((m) => m.id === messageId);
      const title = msg?.campaignName || 'Content Deliverable';

      pushNotification(currentUserId, {
        type: 'posted',
        title: 'Content Marked as Posted',
        description: `"${title}" was marked as Posted. Action locked.`,
        conversationId,
        messageId
      });

      showToast(`✓ Marked as Posted: "${title}"`, 'success');
    },
    [currentUserId, conversationsMap, showToast, pushNotification]
  );

  const markAsNotPosted = useCallback(
    (conversationId: string, messageId: string, reason: string, comments: string) => {
      if (!currentUserId) return;
      const key = `${currentUserId}_${messageId}`;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newAction: MessageAction = {
        id: `act-${Date.now()}`,
        userId: currentUserId,
        conversationId,
        messageId,
        status: 'not_posted',
        reason,
        comments,
        timestamp: timeStr
      };

      setActionsMap((prev) => ({
        ...prev,
        [key]: newAction
      }));

      // Add notification
      const conv = conversationsMap[currentUserId]?.find((c) => c.id === conversationId);
      const msg = conv?.messages.find((m) => m.id === messageId);
      const title = msg?.campaignName || 'Content Deliverable';

      pushNotification(currentUserId, {
        type: 'not_posted',
        title: 'Marked Need Revision',
        description: `"${title}" needs revision: ${reason}.`,
        conversationId,
        messageId
      });

      showToast(`Saved as Need Revision: ${reason}`, 'info');
    },
    [currentUserId, conversationsMap, showToast, pushNotification]
  );

  const markMessagesAsRead = useCallback(
    (conversationId: string) => {
      if (!currentUserId) return;
      setConversationsMap((prev) => {
        const userConvs = prev[currentUserId] || [];
        const updated = userConvs.map((c) => {
          if (c.id === conversationId) {
            const updatedMessages = c.messages.map((m) => {
              if (m.senderId !== currentUserId && m.isRead === false) {
                return { ...m, isRead: true };
              }
              return m;
            });
            return {
              ...c,
              unreadCount: 0,
              messages: updatedMessages
            };
          }
          return c;
        });
        return {
          ...prev,
          [currentUserId]: updated
        };
      });
    },
    [currentUserId]
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string, options?: SendMessageOptions) => {
      const hasText = Boolean(text.trim());
      const hasImages = Boolean(options?.images && options.images.length > 0);
      const hasVideos = Boolean(options?.videos && options.videos.length > 0);
      if ((!hasText && !hasImages && !hasVideos) || !currentUserId || !currentUser) return;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isAdmin = currentUser.role === 'Admin';
      const category = options?.category;
      const attachedImages = options?.images || [];
      const attachedVideos = options?.videos || [];
      const contentLanguage = options?.contentLanguage || 'en';

      // =======================================================================
      // CASE 1: ADMIN SENDS FLYER (BROADCAST TO ALL MARKETERS)
      // =======================================================================
      if (isAdmin && category === 'flyer') {
        const campaignId = `camp-${Date.now()}`;
        const campaignName =
          options?.title?.trim() || (text.trim().slice(0, 50) || 'Flyer Broadcast Campaign');

        setConversationsMap((prev) => {
          const next = { ...prev };

          // 1. Add to all conversations of user-admin
          const adminConvs = next['user-admin'] || [];
          next['user-admin'] = adminConvs.map((c) => {
            const adminMsg: Message = {
              id: `msg-${campaignId}-${c.id}`,
              conversationId: c.id,
              senderId: 'user-admin',
              senderName: 'Admin',
              senderAvatar: currentUser.avatar,
              isSenderMe: true,
              type: 'creative',
              contentCategory: 'flyer',
              contentLanguage,
              campaignId,
              campaignName,
              text: text.trim(),
              images: attachedImages,
              date: 'Today',
              timestamp: timeStr,
              isPostable: true,
              postingStatus: 'pending',
              deliveryStatus: 'delivered'
            };
            return {
              ...c,
              lastMessage: `[Flyer] ${campaignName}`,
              lastMessageTime: timeStr,
              messages: [...c.messages, adminMsg]
            };
          });

          // 2. Add to all marketer accounts (e.g. user-marketer and any other users)
          Object.keys(next).forEach((uid) => {
            if (uid !== 'user-admin') {
              const marketerConvs = next[uid] || [];
              next[uid] = marketerConvs.map((mc) => {
                const marketerMsg: Message = {
                  id: `msg-${campaignId}-${mc.id}`,
                  conversationId: mc.id,
                  senderId: 'user-admin',
                  senderName: 'Admin',
                  senderAvatar: currentUser.avatar,
                  isSenderMe: false,
                  type: 'creative',
                  contentCategory: 'flyer',
                  contentLanguage,
                  campaignId,
                  campaignName,
                  text: text.trim(),
                  images: attachedImages,
                  date: 'Today',
                  timestamp: timeStr,
                  isPostable: true,
                  postingStatus: 'pending',
                  isRead: false
                };
                return {
                  ...mc,
                  lastMessage: `[Flyer] ${campaignName}`,
                  lastMessageTime: timeStr,
                  unreadCount: mc.unreadCount + 1,
                  messages: [...mc.messages, marketerMsg]
                };
              });
            }
          });

          return next;
        });

        // New-message alerts for every marketer inbox
        setNotificationsMap((prev) => {
          const next = { ...prev };
          const marketerIds = new Set([
            ...Object.keys(next),
            ...Object.keys(conversationsMap).filter((id) => id !== 'user-admin')
          ]);
          marketerIds.forEach((uid) => {
            if (uid === 'user-admin') return;
            const notif = buildNotification({
              userId: uid,
              type: 'new_message',
              title: `New Flyer: ${campaignName}`,
              description: 'Admin sent new content. Open Chats to review and post when ready.',
              conversationId: (conversationsMap[uid] || [])[0]?.id
            });
            next[uid] = [notif, ...(next[uid] || [])];
          });
          return next;
        });

        showToast('✓ Flyer campaign broadcast to all marketers!', 'success');
        return;
      }

      // =======================================================================
      // CASE 2: ADMIN SENDS PERSONALIZED (TARGETED TO ONE SPECIFIC MARKETER ONLY)
      // =======================================================================
      if (isAdmin && category === 'personalized') {
        const targetConvId = options?.recipientUserId || conversationId;
        const recipientName = options?.recipientName || 'Marketer';
        const title = options?.title?.trim() || 'Personalized Deliverable';
        const persMsgId = `msg-pers-${Date.now()}`;

        const isRaphaelTarget =
          targetConvId === 'conv-raphael-ali' ||
          targetConvId === 'contact-raphael' ||
          recipientName.toLowerCase().includes('raphael');

        const hasMedia = attachedImages.length > 0 || attachedVideos.length > 0;

        setConversationsMap((prev) => {
          const next = { ...prev };

          // 1. Add ONLY to the target conversation in user-admin's inbox
          const adminConvs = next['user-admin'] || [];
          next['user-admin'] = adminConvs.map((c) => {
            if (c.id === targetConvId || (isRaphaelTarget && c.id === 'conv-raphael-ali')) {
              const persMsg: Message = {
                id: persMsgId,
                conversationId: c.id,
                senderId: 'user-admin',
                senderName: 'Admin',
                senderAvatar: currentUser.avatar,
                isSenderMe: true,
                type: hasMedia ? 'creative' : 'text',
                contentCategory: 'personalized',
                recipientUserId: targetConvId,
                recipientName,
                campaignName: title,
                text: text.trim(),
                images: attachedImages,
                videos: attachedVideos.length > 0 ? attachedVideos : undefined,
                date: 'Today',
                timestamp: timeStr,
                isPostable: hasMedia,
                postingStatus: hasMedia ? 'pending' : undefined,
                deliveryStatus: 'delivered'
              };
              return {
                ...c,
                lastMessage: `[Personalized] ${text.trim() || title}`,
                lastMessageTime: timeStr,
                messages: [...c.messages, persMsg]
              };
            }
            return c;
          });

          // 2. Deliver ONLY to the target marketer (e.g. if Raphael is targeted, deliver to user-marketer)
          // If Sarah, Michael, or Elena is targeted, user-marketer does NOT receive it!
          if (isRaphaelTarget && next['user-marketer']) {
            next['user-marketer'] = next['user-marketer'].map((mc) => {
              const marketerPersMsg: Message = {
                id: persMsgId,
                conversationId: mc.id,
                senderId: 'user-admin',
                senderName: 'Admin',
                senderAvatar: currentUser.avatar,
                isSenderMe: false,
                type: hasMedia ? 'creative' : 'text',
                contentCategory: 'personalized',
                recipientUserId: 'user-marketer',
                recipientName: 'Raphael Rivera Berríos',
                campaignName: title,
                text: text.trim(),
                images: attachedImages,
                videos: attachedVideos.length > 0 ? attachedVideos : undefined,
                date: 'Today',
                timestamp: timeStr,
                isPostable: hasMedia,
                postingStatus: hasMedia ? 'pending' : undefined,
                isRead: false
              };
              return {
                ...mc,
                lastMessage: `[Personalized] ${text.trim() || title}`,
                lastMessageTime: timeStr,
                unreadCount: mc.unreadCount + 1,
                messages: [...mc.messages, marketerPersMsg]
              };
            });
          }

          return next;
        });

        if (isRaphaelTarget) {
          pushNotification('user-marketer', {
            type: 'new_message',
            title: 'New Personalized Message',
            description: `Admin sent you personalized content: "${text.trim().slice(0, 35) || title}"`,
            conversationId: 'conv-marketer-assigned'
          });
        }

        showToast(`✓ Personalized content sent to ${recipientName}!`, 'success');
        return;
      }

      // =======================================================================
      // CASE 2.5: ADMIN SENDS NORMAL MESSAGE (PLAIN CHAT — NOT FLYER / PERSONALIZED)
      // =======================================================================
      if (isAdmin && category === 'normal') {
        const targetConvId = options?.recipientUserId || conversationId;
        const recipientName = options?.recipientName || 'Marketer';
        const normalMsgId = `msg-normal-${Date.now()}`;
        const isRaphaelTarget =
          targetConvId === 'conv-raphael-ali' ||
          targetConvId === 'contact-raphael' ||
          conversationId === 'conv-raphael-ali' ||
          recipientName.toLowerCase().includes('raphael');

        setConversationsMap((prev) => {
          const next = { ...prev };
          const adminConvs = next['user-admin'] || [];

          next['user-admin'] = adminConvs.map((c) => {
            if (c.id === conversationId || c.id === targetConvId || (isRaphaelTarget && c.id === 'conv-raphael-ali')) {
              const normalMsg: Message = {
                id: normalMsgId,
                conversationId: c.id,
                senderId: 'user-admin',
                senderName: 'Admin',
                senderAvatar: currentUser.avatar,
                isSenderMe: true,
                type: attachedImages.length > 0 ? 'creative' : 'text',
                contentCategory: 'normal',
                text: text.trim(),
                images: attachedImages.length > 0 ? attachedImages : undefined,
                date: 'Today',
                timestamp: timeStr,
                isPostable: false,
                deliveryStatus: 'delivered'
              };
              return {
                ...c,
                lastMessage: text.trim() || '[Normal message]',
                lastMessageTime: timeStr,
                messages: [...c.messages, normalMsg]
              };
            }
            return c;
          });

          if (isRaphaelTarget && next['user-marketer']) {
            next['user-marketer'] = next['user-marketer'].map((mc) => {
              const marketerNormalMsg: Message = {
                id: normalMsgId,
                conversationId: mc.id,
                senderId: 'user-admin',
                senderName: 'Admin',
                senderAvatar: currentUser.avatar,
                isSenderMe: false,
                type: attachedImages.length > 0 ? 'creative' : 'text',
                contentCategory: 'normal',
                text: text.trim(),
                images: attachedImages.length > 0 ? attachedImages : undefined,
                date: 'Today',
                timestamp: timeStr,
                isPostable: false,
                isRead: false
              };
              return {
                ...mc,
                lastMessage: text.trim() || '[Normal message]',
                lastMessageTime: timeStr,
                unreadCount: mc.unreadCount + 1,
                messages: [...mc.messages, marketerNormalMsg]
              };
            });
          }

          return next;
        });

        if (isRaphaelTarget) {
          pushNotification('user-marketer', {
            type: 'new_message',
            title: 'New Message',
            description: `Admin: "${text.trim().slice(0, 50) || 'Sent a message'}"`,
            conversationId: 'conv-marketer-assigned'
          });
        }

        showToast(`✓ Normal message sent to ${recipientName}!`, 'success');
        return;
      }

      // =======================================================================
      // CASE 3: STANDARD MESSAGE (TEXT REPLY FROM MARKETER OR ADMIN)
      // =======================================================================
      const newMsgId = `msg-${Date.now()}`;
      const newMsg: Message = {
        id: newMsgId,
        conversationId,
        senderId: currentUserId,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        isSenderMe: true,
        type: 'text',
        contentCategory: currentUser.role === 'Admin' ? 'normal' : undefined,
        text: text.trim(),
        timestamp: timeStr,
        date: 'Today',
        isPostable: false,
        deliveryStatus: 'sent'
      };

      setConversationsMap((prev) => {
        const next = { ...prev };
        const userConvs = next[currentUserId] || [];
        next[currentUserId] = userConvs.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: text.trim(),
              lastMessageTime: timeStr,
              unreadCount: 0,
              messages: [
                ...c.messages.map((m) =>
                  m.senderId !== currentUserId ? { ...m, isRead: true } : m
                ),
                newMsg
              ]
            };
          }
          return c;
        });

        // If marketer sent reply, also mirror to user-admin's Raphael conversation
        if (currentUserId === 'user-marketer') {
          const adminConvs = next['user-admin'] || [];
          next['user-admin'] = adminConvs.map((ac) => {
            if (ac.id === 'conv-raphael-ali') {
              const mirroredMsg: Message = {
                ...newMsg,
                conversationId: ac.id,
                isSenderMe: false,
                senderId: 'contact-raphael',
                senderName: 'Raphael Rivera Berríos'
              };
              return {
                ...ac,
                lastMessage: text.trim(),
                lastMessageTime: timeStr,
                unreadCount: ac.unreadCount + 1,
                messages: [...ac.messages, mirroredMsg]
              };
            }
            return ac;
          });
        }

        return next;
      });

      // Transition to 'delivered' and 'read'
      setTimeout(() => {
        setConversationsMap((prev) => {
          const next = { ...prev };
          const userConvs = next[currentUserId] || [];
          next[currentUserId] = userConvs.map((c) => {
            if (c.id === conversationId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === newMsgId ? { ...m, deliveryStatus: 'delivered' as const } : m
                )
              };
            }
            return c;
          });
          return next;
        });
      }, 850);

      setTimeout(() => {
        setConversationsMap((prev) => {
          const next = { ...prev };
          const userConvs = next[currentUserId] || [];
          next[currentUserId] = userConvs.map((c) => {
            if (c.id === conversationId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === newMsgId ? { ...m, deliveryStatus: 'read' as const } : m
                )
              };
            }
            return c;
          });
          return next;
        });
      }, 2200);
    },
    [currentUserId, currentUser, showToast, conversationsMap, pushNotification]
  );

  const sendBulkMessage = useCallback(
    (options: BulkSendOptions): { success: boolean; deliveredCount: number; message?: string } => {
      const {
        category,
        title,
        text,
        images = [],
        videos = [],
        recipientConversationIds,
        silent,
        contentLanguage = 'en'
      } = options;
      const hasContent = Boolean(title?.trim() || text.trim() || images.length > 0 || videos.length > 0);
      if (!hasContent) {
        return { success: false, deliveredCount: 0, message: 'Message content cannot be empty.' };
      }
      if (!currentUserId || !currentUser || currentUser.role !== 'Admin') {
        return { success: false, deliveredCount: 0, message: 'Only Admins can use Bulk Sender.' };
      }
      if (!recipientConversationIds || recipientConversationIds.length === 0) {
        return { success: false, deliveredCount: 0, message: 'Please select at least one recipient.' };
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const campaignId = `camp-bulk-${Date.now()}`;
      const categoryLabel =
        category === 'flyer' ? 'Flyer' : category === 'personalized' ? 'Personalized' : 'Normal';
      const campaignTitle =
        title?.trim() ||
        (category === 'flyer'
          ? 'Flyer Campaign'
          : category === 'personalized'
            ? 'Personalized Deliverable'
            : 'Normal Message');
      const attachedImages = images.map((img) => resolveImageUrl(img));
      const attachedVideos = videos.filter(Boolean);
      const hasMedia = attachedImages.length > 0 || attachedVideos.length > 0;
      const isPostableContent =
        category === 'flyer' || (category !== 'normal' && hasMedia);

      // Determine targeted conversations in user-admin
      const adminConvs = conversationsMap['user-admin'] || [];
      const isAll = recipientConversationIds.includes('all');
      const targetConvs = isAll
        ? adminConvs
        : adminConvs.filter((c) => recipientConversationIds.includes(c.id));

      if (targetConvs.length === 0) {
        return { success: false, deliveredCount: 0, message: 'No matching marketer conversations found.' };
      }

      // Check whether Raphael / user-marketer is one of the targeted recipients
      const targetsRaphael =
        isAll ||
        targetConvs.some(
          (c) =>
            c.id === 'conv-raphael-ali' ||
            c.senderId === 'contact-raphael' ||
            c.senderName.toLowerCase().includes('raphael')
        );

      setConversationsMap((prev) => {
        const next = { ...prev };

        // 1. Update user-admin conversations
        const currentAdminConvs = next['user-admin'] || [];
        next['user-admin'] = currentAdminConvs.map((c) => {
          const isTargeted = isAll || recipientConversationIds.includes(c.id);

          if (!isTargeted) return c;

          const msgId = `msg-bulk-${campaignId}-${c.id}`;
          const adminMsg: Message = {
            id: msgId,
            conversationId: c.id,
            senderId: 'user-admin',
            senderName: 'Admin',
            senderAvatar: currentUser.avatar,
            isSenderMe: true,
            type: hasMedia ? 'creative' : 'text',
            contentCategory: category,
            contentLanguage,
            campaignId,
            campaignName: campaignTitle,
            text: text.trim(),
            images: attachedImages,
            videos: attachedVideos.length > 0 ? attachedVideos : undefined,
            date: 'Today',
            timestamp: timeStr,
            isPostable: isPostableContent,
            postingStatus: isPostableContent ? 'pending' : undefined,
            deliveryStatus: 'delivered',
            recipientName: c.senderName,
            recipientUserId: c.senderId
          };

          return {
            ...c,
            lastMessage: `[${categoryLabel}] ${campaignTitle}`,
            lastMessageTime: timeStr,
            messages: [...c.messages, adminMsg]
          };
        });

        // 2. Mirror to user-marketer (the demo marketer account assigned to Raphael)
        if (targetsRaphael && next['user-marketer']) {
          next['user-marketer'] = next['user-marketer'].map((mc) => {
            const msgId = `msg-bulk-${campaignId}-${mc.id}`;
            const marketerMsg: Message = {
              id: msgId,
              conversationId: mc.id,
              senderId: 'user-admin',
              senderName: 'Admin',
              senderAvatar: currentUser.avatar,
              isSenderMe: false,
              type: hasMedia ? 'creative' : 'text',
              contentCategory: category,
              contentLanguage,
              campaignId,
              campaignName: campaignTitle,
              text: text.trim(),
              images: attachedImages,
              videos: attachedVideos.length > 0 ? attachedVideos : undefined,
              date: 'Today',
              timestamp: timeStr,
              isPostable: isPostableContent,
              postingStatus: isPostableContent ? 'pending' : undefined,
              isRead: false,
              recipientName: 'Raphael Rivera Berríos',
              recipientUserId: 'user-marketer'
            };

            return {
              ...mc,
              lastMessage: `[${categoryLabel}] ${campaignTitle}`,
              lastMessageTime: timeStr,
              unreadCount: mc.unreadCount + 1,
              messages: [...mc.messages, marketerMsg]
            };
          });
        }

        return next;
      });

      // 3. New-message / update alerts for targeted marketers
      if (targetsRaphael) {
        pushNotification('user-marketer', {
          type: 'new_message',
          title: `New ${categoryLabel}: ${campaignTitle}`,
          description:
            text.trim() ||
            (category === 'flyer'
              ? 'Admin delivered a new flyer deliverable.'
              : category === 'personalized'
                ? 'Admin delivered personalized instructions.'
                : 'Admin sent a normal message.'),
          conversationId: 'conv-marketer-assigned'
        });
      }

      if (!silent) {
        showToast(
          `✓ Content successfully delivered to ${targetConvs.length} marketer${targetConvs.length > 1 ? 's' : ''}!`,
          'success'
        );
      }

      return { success: true, deliveredCount: targetConvs.length };
    },
    [currentUserId, currentUser, conversationsMap, showToast, pushNotification]
  );

  const scheduleBulkSend = useCallback(
    (options: ScheduleBulkSendOptions): { success: boolean; message?: string } => {
      const {
        category,
        title,
        text,
        images = [],
        videos = [],
        recipientConversationIds,
        recipientLabel,
        scheduledFor
      } = options;

      const hasContent = Boolean(title?.trim() || text.trim() || images.length > 0 || videos.length > 0);
      if (!hasContent) {
        return { success: false, message: 'Message content cannot be empty.' };
      }
      if (!currentUserId || !currentUser || currentUser.role !== 'Admin') {
        return { success: false, message: 'Only Admins can schedule content.' };
      }
      if (!recipientConversationIds || recipientConversationIds.length === 0) {
        return { success: false, message: 'Please select at least one recipient.' };
      }

      const when = new Date(scheduledFor);
      if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
        return { success: false, message: 'Pick a future date and time.' };
      }

      const campaignTitle =
        title?.trim() ||
        (category === 'flyer'
          ? 'Flyer Campaign'
          : category === 'personalized'
            ? 'Personalized Deliverable'
            : 'Normal Message');

      const entry: ScheduledSend = {
        id: `sched-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        category,
        title: campaignTitle,
        text: text.trim(),
        images: images.map((img) => compactMediaUrl(resolveImageUrl(img), 'image')),
        videos:
          videos.length > 0
            ? videos.map((vid) => compactMediaUrl(vid, 'video'))
            : undefined,
        recipientConversationIds,
        recipientLabel,
        scheduledFor: when.toISOString(),
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };

      setScheduledSends((prev) => [entry, ...prev]);
      showToast(
        `Scheduled "${campaignTitle}" for ${when.toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        'success'
      );
      return { success: true };
    },
    [currentUserId, currentUser, showToast]
  );

  const cancelScheduledSend = useCallback(
    (id: string) => {
      setScheduledSends((prev) =>
        prev.map((s) =>
          s.id === id && s.status === 'scheduled' ? { ...s, status: 'cancelled' as const } : s
        )
      );
      showToast('Scheduled send cancelled', 'info');
    },
    [showToast]
  );

  const sendScheduledNow = useCallback(
    (id: string): { success: boolean; message?: string } => {
      const item = scheduledSends.find((s) => s.id === id);
      if (!item || item.status !== 'scheduled') {
        return { success: false, message: 'Scheduled item not found.' };
      }

      const result = sendBulkMessage({
        category: item.category,
        title: item.title,
        text: item.text,
        images: item.images,
        videos: item.videos,
        recipientConversationIds: item.recipientConversationIds,
        silent: false
      });

      if (result.success) {
        setScheduledSends((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, status: 'sent' as const, sentAt: new Date().toISOString() }
              : s
          )
        );
      }

      return {
        success: result.success,
        message: result.message
      };
    },
    [scheduledSends, sendBulkMessage]
  );

  const scheduledSendsRef = React.useRef(scheduledSends);
  scheduledSendsRef.current = scheduledSends;

  // Auto-dispatch due scheduled sends
  useEffect(() => {
    const processing = new Set<string>();

    const tick = () => {
      const now = Date.now();
      const due = scheduledSendsRef.current.filter(
        (s) =>
          s.status === 'scheduled' &&
          new Date(s.scheduledFor).getTime() <= now &&
          !processing.has(s.id)
      );
      if (due.length === 0) return;

      due.forEach((item) => {
        processing.add(item.id);
        const result = sendBulkMessage({
          category: item.category,
          title: item.title,
          text: item.text,
          images: item.images,
          videos: item.videos,
          recipientConversationIds: item.recipientConversationIds,
          silent: true
        });
        if (result.success) {
          setScheduledSends((prev) =>
            prev.map((s) =>
              s.id === item.id
                ? { ...s, status: 'sent' as const, sentAt: new Date().toISOString() }
                : s
            )
          );
          showToast(
            `✓ Scheduled "${item.title}" sent to ${result.deliveredCount} marketer${
              result.deliveredCount === 1 ? '' : 's'
            }`,
            'success'
          );
        } else {
          processing.delete(item.id);
          showToast(result.message || 'Scheduled send failed', 'error');
        }
      });
    };

    const intervalId = window.setInterval(tick, 12000);
    tick();
    return () => window.clearInterval(intervalId);
  }, [sendBulkMessage, showToast]);

  const upcomingScheduledCount = useMemo(
    () => scheduledSends.filter((s) => s.status === 'scheduled').length,
    [scheduledSends]
  );

  const openConversation = useCallback(
    (id: string, targetMsgId?: string) => {
      // If user is Marketer, restrict to their assigned conversation
      if (currentUser?.role === 'Marketer') {
        const assignedId = conversations[0]?.id;
        setActiveConversationId(assignedId || id);
      } else {
        setActiveConversationId(id);
      }
      setActiveTab('conversations');
      setTargetMessageId(targetMsgId || null);
      if (currentUserId) {
        setConversationsMap((prev) => {
          const userConvs = prev[currentUserId] || [];
          const updated = userConvs.map((c) => {
            if (c.id === id) {
              return { ...c, unreadCount: 0 };
            }
            return c;
          });
          return {
            ...prev,
            [currentUserId]: updated
          };
        });
      }
    },
    [currentUserId, currentUser, conversations]
  );

  const closeConversation = useCallback(() => {
    // If Marketer, do not close or navigate back to the inbox
    if (currentUser?.role === 'Marketer') {
      return;
    }
    setActiveConversationId(null);
    setTargetMessageId(null);
  }, [currentUser]);

  const openAssignedChat = useCallback(() => {
    if (currentUser?.role === 'Marketer') {
      const assignedId = conversations[0]?.id;
      if (assignedId) setActiveConversationId(assignedId);
    } else if (!activeConversationId && conversations[0]?.id) {
      setActiveConversationId(conversations[0].id);
    }
    setActiveTab('conversations');
  }, [currentUser?.role, conversations, activeConversationId]);

  const openChatsWithPostingFilter = useCallback(
    (filter: ChatPostingFilter) => {
      setChatPostingFilter(filter);
      setChatCategoryFilter('all');
      setChatFilterNavToken((n) => n + 1);
      openAssignedChat();
    },
    [openAssignedChat]
  );

  const openChatsWithCategoryFilter = useCallback(
    (filter: ChatCategoryFilter) => {
      setChatCategoryFilter(filter);
      setChatPostingFilter('all');
      setChatFilterNavToken((n) => n + 1);
      openAssignedChat();
    },
    [openAssignedChat]
  );

  const openLeadsWithAccidentType = useCallback((type: FlyerCategory | 'all') => {
    setLeadsAccidentTypeFilter(type);
    setActiveTab('leads');
  }, []);

  const openNotPostedModal = useCallback(
    (conversationId: string, messageId: string, campaignName?: string) => {
      setNotPostedModal({
        isOpen: true,
        conversationId,
        messageId,
        campaignName
      });
    },
    []
  );

  const closeNotPostedModal = useCallback(() => {
    setNotPostedModal({
      isOpen: false,
      conversationId: null,
      messageId: null
    });
  }, []);

  const openLanguageRequestModal = useCallback(
    (
      conversationId: string,
      messageId: string,
      campaignName?: string,
      contentLanguage: RequestableContentLanguage = 'en'
    ) => {
      setLanguageRequestModal({
        isOpen: true,
        conversationId,
        messageId,
        campaignName,
        contentLanguage
      });
    },
    []
  );

  const closeLanguageRequestModal = useCallback(() => {
    setLanguageRequestModal({
      isOpen: false,
      conversationId: null,
      messageId: null,
      contentLanguage: 'en'
    });
  }, []);

  /** Latest language request for this message (marketer may request more than once) */
  const getLanguageRequestForMessage = useCallback(
    (messageId: string) => {
      if (!currentUserId) return undefined;
      return languageRequests.find(
        (r) => r.messageId === messageId && r.userId === currentUserId
      );
    },
    [languageRequests, currentUserId]
  );

  const submitLanguageRequest = useCallback(
    (payload: {
      conversationId: string;
      messageId: string;
      campaignName?: string;
      sourceLanguage: RequestableContentLanguage;
      requestedLanguage: RequestableContentLanguage;
      requestedLanguageLabel: string;
    }): { success: boolean; message?: string } => {
      if (!currentUserId || !currentUser) {
        return { success: false, message: 'Not signed in.' };
      }

      if (payload.requestedLanguage === payload.sourceLanguage) {
        showToast('Pick a different language than the current message.', 'error');
        return { success: false, message: 'Same as message language.' };
      }

      const request: LanguageContentRequest = {
        id: `lang-req-${Date.now()}`,
        userId: currentUserId,
        userName: currentUser.name,
        conversationId: payload.conversationId,
        messageId: payload.messageId,
        campaignName: payload.campaignName,
        sourceLanguage: payload.sourceLanguage,
        requestedLanguage: payload.requestedLanguage,
        requestedLanguageLabel: payload.requestedLanguageLabel,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      setLanguageRequests((prev) => [request, ...prev]);

      pushNotification(currentUserId, {
        type: 'message_update',
        title: 'Language request submitted',
        description: `You requested ${payload.requestedLanguageLabel} for "${
          payload.campaignName || 'this content'
        }". Admin will follow up.`,
        conversationId: payload.conversationId,
        messageId: payload.messageId
      });

      pushNotification('user-admin', {
        type: 'message_update',
        title: 'Language request',
        description: `${currentUser.name} asked for ${payload.requestedLanguageLabel} on "${
          payload.campaignName || 'content'
        }".`,
        conversationId: payload.conversationId,
        messageId: payload.messageId
      });

      showToast(`Language request sent: ${payload.requestedLanguageLabel}`, 'success');
      return { success: true };
    },
    [currentUserId, currentUser, languageRequests, pushNotification, showToast]
  );

  // Image Lightbox Viewer
  const openImageViewer = useCallback((images: string[], index = 0, title?: string) => {
    setImageViewer({
      isOpen: true,
      images,
      activeIndex: Math.max(0, Math.min(index, images.length - 1)),
      title
    });
  }, []);

  const closeImageViewer = useCallback(() => {
    setImageViewer((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const nextImage = useCallback(() => {
    setImageViewer((prev) => {
      if (!prev.images.length) return prev;
      const nextIdx = (prev.activeIndex + 1) % prev.images.length;
      return { ...prev, activeIndex: nextIdx };
    });
  }, []);

  const prevImage = useCallback(() => {
    setImageViewer((prev) => {
      if (!prev.images.length) return prev;
      const prevIdx = (prev.activeIndex - 1 + prev.images.length) % prev.images.length;
      return { ...prev, activeIndex: prevIdx };
    });
  }, []);

  const markNotificationAsRead = useCallback(
    (id: string) => {
      if (!currentUserId) return;
      setNotificationsMap((prev) => {
        const userNotifs = prev[currentUserId] || [];
        return {
          ...prev,
          [currentUserId]: userNotifs.map((n) => (n.id === id ? { ...n, read: true } : n))
        };
      });
    },
    [currentUserId]
  );

  const markAllNotificationsAsRead = useCallback(() => {
    if (!currentUserId) return;
    setNotificationsMap((prev) => {
      const userNotifs = prev[currentUserId] || [];
      return {
        ...prev,
        [currentUserId]: userNotifs.map((n) => ({ ...n, read: true }))
      };
    });
    showToast('All notifications marked as read', 'info');
  }, [currentUserId, showToast]);

  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return (localStorage.getItem('marketpulse_lang') as AppLanguage) || 'en';
  });

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('marketpulse_lang', lang);
  }, []);

  const t = useMemo(() => getTranslation(language), [language]);

  const approveMarketer = useCallback(
    (userId: string) => {
      const nowIso = new Date().toISOString();
      const applicant = users.find((u) => u.id === userId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                approvalStatus: 'approved' as const,
                reviewedAt: nowIso,
                reviewedBy: currentUserId || 'user-admin',
                rejectionReason: undefined
              }
            : u
        )
      );

      pushNotification(userId, {
        type: 'approval_update',
        title: 'Account Approved',
        description:
          'Your marketer account has been approved. You can now access Conversations and start working.'
      });

      // Direct + indirect referrers get team application status alerts
      const upline = getReferrerUplineIds(users, userId);
      upline.forEach((referrerId, idx) => {
        pushNotification(referrerId, {
          type: 'team_application',
          title: idx === 0 ? 'Direct referral approved' : 'Downline referral approved',
          description: `${applicant?.name || 'A team member'} was approved${
            idx === 0 ? ' from your referral' : ' in your network'
          }.`,
          relatedUserId: userId
        });
      });

      showToast('Marketer account approved — they can now log in and work.', 'success');
    },
    [currentUserId, showToast, users, pushNotification]
  );

  const rejectMarketer = useCallback(
    (userId: string, reason?: string) => {
      const nowIso = new Date().toISOString();
      const rejectionReason = reason || 'Application declined by operations.';
      const applicant = users.find((u) => u.id === userId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                approvalStatus: 'rejected' as const,
                rejectionReason,
                reviewedAt: nowIso,
                reviewedBy: currentUserId || 'user-admin'
              }
            : u
        )
      );

      pushNotification(userId, {
        type: 'approval_update',
        title: 'Registration Not Approved',
        description: rejectionReason
      });

      const upline = getReferrerUplineIds(users, userId);
      upline.forEach((referrerId, idx) => {
        pushNotification(referrerId, {
          type: 'team_application',
          title: idx === 0 ? 'Direct referral not approved' : 'Downline referral not approved',
          description: `${applicant?.name || 'A team member'} was not approved${
            idx === 0 ? ' from your referral' : ' in your network'
          }.`,
          relatedUserId: userId
        });
      });

      showToast('Marketer account rejected', 'info');
    },
    [currentUserId, showToast, users, pushNotification]
  );

  const completePageTour = useCallback(
    (page: TourPage) => {
      if (!currentUserId) return;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== currentUserId) return u;
          // Sample tour account never locks pages
          if (u.isTourDemo) {
            return { ...u, hasCompletedTour: false, completedTourPages: [] };
          }
          const done = new Set(u.completedTourPages || []);
          done.add(page);
          const pages = Array.from(done) as TourPage[];
          return {
            ...u,
            completedTourPages: pages,
            hasCompletedTour: TOUR_PAGES.every((p) => pages.includes(p))
          };
        })
      );
    },
    [currentUserId]
  );

  /** Marks all pages complete (legacy / skip-all welcome) */
  const completeTour = useCallback(() => {
    if (!currentUserId) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUserId) return u;
        if (u.isTourDemo) return { ...u, hasCompletedTour: false, completedTourPages: [] };
        return { ...u, hasCompletedTour: true, completedTourPages: [...TOUR_PAGES] };
      })
    );
  }, [currentUserId]);

  const [tourReplayToken, setTourReplayToken] = useState(0);

  const reopenPageTour = useCallback(
    (page: TourPage) => {
      if (!currentUserId) return;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== currentUserId) return u;
          if (u.isTourDemo) return { ...u, completedTourPages: [], hasCompletedTour: false };
          const pages = (u.completedTourPages || []).filter((p) => p !== page);
          return {
            ...u,
            completedTourPages: pages,
            hasCompletedTour: false
          };
        })
      );
      setActiveTab(page);
      setTourReplayToken((n) => n + 1);
    },
    [currentUserId]
  );

  const login = useCallback(
    (email: string, password?: string) => {
      const cleanEmail = email.trim().toLowerCase();
      const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!user) {
        return { success: false, message: 'Invalid email or password.' };
      }

      if (password && user.password && user.password !== password) {
        return { success: false, message: 'Invalid email or password.' };
      }

      // Marketers must be approved before any app activity
      if (user.role === 'Marketer' && user.approvalStatus === 'pending') {
        return {
          success: false,
          message: 'Your account is pending admin approval.',
          approvalStatus: 'pending',
          user
        };
      }

      if (user.role === 'Marketer' && user.approvalStatus === 'rejected') {
        return {
          success: false,
          message: 'Your marketer account application has been rejected.',
          approvalStatus: 'rejected',
          user
        };
      }

      setSignupSuccessMessage(null);
      setCurrentUserId(user.id);
      setIsAuthenticated(true);
      setTargetMessageId(null);
      setActiveTab('conversations');
      setAuthView('app');

      if (user.role === 'Marketer') {
        const userConvs = conversationsMap[user.id] || INITIAL_CONVERSATIONS[user.id] || [];
        const assigned = userConvs[0];
        setActiveConversationId(assigned ? assigned.id : 'conv-marketer-assigned');
      } else {
        // Admin logs into All Marketers inbox directly
        setActiveConversationId(null);
      }

      showToast(`Welcome back, ${user.name}!`, 'success');
      return { success: true, user, approvalStatus: user.approvalStatus };
    },
    [users, conversationsMap, showToast]
  );

  // Create Account per requirement:
  // "When Create Account is clicked:
  // - Create a local mock user
  // - Save the user in local mock state
  // - Do NOT automatically switch between users
  // - Return user to Login screen
  // - Show a professional success message:
  // 'Account created successfully. Please login to continue.'"
  const signup = useCallback(
    (newUserData: Omit<User, 'id'>) => {
      const newId = `user-${Date.now()}`;
      const referralCode = buildReferralCode({ id: newId, name: newUserData.name });
      const referrerId =
        newUserData.referredByUserId ||
        findUserByReferralCode(
          // use functional lookup against latest via closure — refreshed below
          users,
          pendingReferralCode || undefined
        )?.id;

      const newUser: User = {
        ...newUserData,
        id: newId,
        role: 'Marketer',
        company: 'BrandPulse Agency',
        approvalStatus: 'pending',
        hasCompletedTour: false,
        completedTourPages: [],
        registeredAt: newUserData.registeredAt || new Date().toISOString(),
        referralCode,
        referredByUserId: referrerId
      };

      setUsers((prev) => ensureAllReferralCodes([...prev, newUser]));
      clearPendingRef();
      setPendingReferralCodeState(null);
      setRegisteredEmail(newUserData.email);
      setSignupSuccessMessage(
        'Account created successfully. Your registration is pending admin approval — you can log in after approval.'
      );

      // Seed fresh inbox for new marketer so their dashboard is ready upon login
      setConversationsMap((prev) => ({
        ...prev,
        [newId]: [
          {
            id: `conv-raphael-${newId}`,
            userId: newId,
            senderId: 'contact-raphael',
            senderName: 'Raphael Rivera Berríos',
            senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
            senderRole: 'Creative Director',
            senderCompany: 'Horizon Studio',
            isOnline: true,
            lastMessage: 'Welcome to MarketPulse! 3 campaign flyers in package awaiting action.',
            lastMessageTime: 'Just now',
            unreadCount: 1,
            messages: [
              {
                id: `msg-welcome-txt-${newId}`,
                conversationId: `conv-raphael-${newId}`,
                senderId: 'contact-raphael',
                senderName: 'Raphael Rivera Berríos',
                senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
                isSenderMe: false,
                type: 'text',
                text: `Welcome to the team, ${newUser.name}! Here is your first campaign delivery with 3 creative flyers.`,
                timestamp: 'Just now',
                isPostable: false
              },
              {
                id: `msg-welcome-trio-${newId}`,
                conversationId: `conv-raphael-${newId}`,
                senderId: 'contact-raphael',
                senderName: 'Raphael Rivera Berríos',
                senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
                isSenderMe: false,
                type: 'creative',
                text: 'Weekly Social Media Creatives ready for review. 3 flyers in single package.',
                timestamp: 'Just now',
                isPostable: true,
                campaignName: 'Weekly Social Media Creatives',
                platformTarget: 'Instagram, LinkedIn & Facebook',
                images: [
                  ONLINE_FLYER_URLS.promoSale,
                  ONLINE_FLYER_URLS.eventSummit,
                  ONLINE_FLYER_URLS.autumnPromo
                ],
                caption: 'Unified brand narrative across all three channels. Review all 3 flyers together before posting.',
                scheduledTime: 'Today at 04:00 PM',
                notes: 'Mark Posted or Not Posted for the entire 3-flyer delivery.'
              }
            ]
          }
        ]
      }));

      setNotificationsMap((prev) => ({
        ...prev,
        [newId]: [
          buildNotification({
            userId: newId,
            type: 'new_message',
            title: 'Welcome content ready',
            description: '3 flyers delivered in Weekly Social Media Creatives awaiting action.',
            conversationId: `conv-raphael-${newId}`,
            messageId: `msg-welcome-trio-${newId}`
          })
        ]
      }));

      // Alert direct + indirect referrers about the new application
      getReferrerUplineIds([...users, newUser], newId).forEach((uid, idx) => {
        pushNotification(uid, {
          type: 'team_application',
          title: idx === 0 ? 'New direct referral applied' : 'New downline application',
          description: `${newUser.name} registered${
            idx === 0 ? ' with your referral code' : ' in your network'
          }. Status: pending approval.`,
          relatedUserId: newId
        });
      });

      // Return user to login screen (Do NOT auto-login or switch)
      setAuthView('login');
      showToast('Account created successfully. Please login to continue.', 'success');
      return true;
    },
    [showToast, users, pendingReferralCode, pushNotification]
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUserId(null);
    setAuthView('login');
    setActiveConversationId(null);
    showToast('Signed out successfully', 'info');
  }, [showToast]);

  const updateProfile = useCallback(
    (updatedData: Partial<User>) => {
      if (!currentUserId) return;
      setUsers((prev) =>
        prev.map((u) => (u.id === currentUserId ? { ...u, ...updatedData } : u))
      );
      showToast('Profile updated successfully', 'success');
    },
    [currentUserId, showToast]
  );

  const toggleReaction = useCallback(
    (conversationId: string, messageId: string, emoji: ReactionEmoji) => {
      if (!currentUserId || !currentUser) return;

      const apply = (reactions: MessageReaction[] | undefined): MessageReaction[] => {
        const list = [...(reactions || [])];
        const existingIdx = list.findIndex(
          (r) => r.userId === currentUserId && r.emoji === emoji
        );
        if (existingIdx >= 0) {
          list.splice(existingIdx, 1);
          return list;
        }
        // One reaction per user — replace previous emoji if any
        const withoutMine = list.filter((r) => r.userId !== currentUserId);
        withoutMine.push({
          emoji,
          userId: currentUserId,
          userName: currentUser.name
        });
        return withoutMine;
      };

      setConversationsMap((prev) => {
        const next: typeof prev = {};
        for (const [uid, convs] of Object.entries(prev)) {
          next[uid] = convs.map((c) => {
            const touches =
              c.id === conversationId ||
              c.messages.some((m) => m.id === messageId);
            if (!touches) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, reactions: apply(m.reactions) } : m
              )
            };
          });
        }
        return next;
      });
    },
    [currentUserId, currentUser]
  );

  const addLead = useCallback(
    (data: {
      fullName: string;
      phone: string;
      email: string;
      accidentType: FlyerCategory;
      notes: string;
    }) => {
      if (!currentUser || currentUser.role === 'Admin') return;
      const lead: Lead = {
        id: `lead-${Date.now()}`,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        accidentType: data.accidentType,
        notes: data.notes || '',
        createdByUserId: currentUser.id,
        createdByName: currentUser.name,
        createdAt: new Date().toISOString(),
        submissionStatus: 'new'
      };
      setLeads((prev) => [lead, ...prev]);
      showToast('Lead saved successfully', 'success');
    },
    [currentUser, showToast]
  );

  const updateLead = useCallback(
    (
      leadId: string,
      data: {
        fullName: string;
        phone: string;
        email: string;
        accidentType: FlyerCategory;
        notes: string;
      }
    ) => {
      if (!currentUser || currentUser.role === 'Admin') return;
      const existing = leads.find((l) => l.id === leadId);
      if (!existing || existing.createdByUserId !== currentUser.id) {
        showToast('Lead not found', 'error');
        return;
      }
      if (isLeadLocked(existing)) {
        showToast('Lead is locked after 24 hours — edit closed', 'error');
        return;
      }
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                fullName: data.fullName,
                phone: data.phone,
                email: data.email,
                accidentType: data.accidentType,
                notes: data.notes || ''
              }
            : l
        )
      );
      showToast('Lead updated successfully', 'success');
    },
    [currentUser, leads, showToast]
  );

  const deleteLead = useCallback(
    (leadId: string) => {
      if (!currentUser || currentUser.role === 'Admin') return;
      const existing = leads.find((l) => l.id === leadId);
      if (!existing || existing.createdByUserId !== currentUser.id) {
        showToast('Lead not found', 'error');
        return;
      }
      if (isLeadLocked(existing)) {
        showToast('Lead is locked after 24 hours — delete closed', 'error');
        return;
      }
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      showToast('Lead deleted', 'info');
    },
    [currentUser, leads, showToast]
  );

  const updateLeadSubmissionStatus = useCallback(
    (leadId: string, status: LeadSubmissionStatus) => {
      if (!currentUser || currentUser.role !== 'Admin') return;
      const lead = leads.find((l) => l.id === leadId);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, submissionStatus: status } : l))
      );
      if (lead?.createdByUserId) {
        const statusLabel =
          status === 'new' ? 'New' : status === 'in_progress' ? 'In Progress' : 'Rejected';
        pushNotification(lead.createdByUserId, {
          type: 'lead_update',
          title: 'Lead status updated',
          description: `${lead.fullName} is now ${statusLabel}. Open Leads to review.`,
          leadId: lead.id
        });
      }
      showToast('Submission status updated', 'success');
    },
    [currentUser, showToast, leads, pushNotification]
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        authView,
        setAuthView,
        signupSuccessMessage,
        setSignupSuccessMessage,
        registeredEmail,
        login,
        signup,
        logout,
        updateProfile,
        pendingReferralCode,
        setPendingReferralCode,
        getReferralLinkForUser,
        findReferrerByCode,
        activeTab,
        setActiveTab,
        activeConversationId,
        targetMessageId,
        setTargetMessageId,
        openConversation,
        closeConversation,
        chatPostingFilter,
        setChatPostingFilter,
        chatCategoryFilter,
        setChatCategoryFilter,
        chatFilterNavToken,
        openChatsWithPostingFilter,
        openChatsWithCategoryFilter,
        leadsAccidentTypeFilter,
        setLeadsAccidentTypeFilter,
        openLeadsWithAccidentType,
        conversations,
        activeConversation,
        getMessageAction,
        markAsPosted,
        markAsNotPosted,
        sendMessage,
        sendBulkMessage,
        scheduledSends,
        scheduleBulkSend,
        cancelScheduledSend,
        sendScheduledNow,
        upcomingScheduledCount,
        toggleReaction,
        markMessagesAsRead,
        pendingActionsCount,
        pendingMarketerRequestsCount,
        leads,
        addLead,
        updateLead,
        deleteLead,
        updateLeadSubmissionStatus,
        notPostedModal,
        openNotPostedModal,
        closeNotPostedModal,
        languageRequestModal,
        openLanguageRequestModal,
        closeLanguageRequestModal,
        submitLanguageRequest,
        languageRequests,
        getLanguageRequestForMessage,
        imageViewer,
        openImageViewer,
        closeImageViewer,
        nextImage,
        prevImage,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toast,
        showToast,
        users,
        approveMarketer,
        rejectMarketer,
        completeTour,
        completePageTour,
        reopenPageTour,
        tourReplayToken,
        language,
        setLanguage,
        t
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
