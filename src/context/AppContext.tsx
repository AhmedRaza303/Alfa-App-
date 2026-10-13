import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  Conversation,
  NotificationItem,
  MessageAction,
  ActiveTab,
  Message,
  BulkSendOptions,
  AppLanguage
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ACTIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import { resolveImageUrl, ONLINE_FLYER_URLS } from '../utils/imageAssets';
import { getTranslation, TranslationDict } from '../utils/i18n';

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
  recipientUserId?: string;
  recipientName?: string;
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
  approveMarketer: (userId: string) => void;
  rejectMarketer: (userId: string, reason?: string) => void;
  completeTour: () => void;
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

  // Conversations & Actions
  conversations: Conversation[];
  activeConversation: Conversation | null;
  getMessageAction: (messageId: string) => MessageAction | undefined;
  markAsPosted: (conversationId: string, messageId: string) => void;
  markAsNotPosted: (conversationId: string, messageId: string, reason: string, comments: string) => void;
  sendMessage: (conversationId: string, text: string, options?: SendMessageOptions) => void;
  sendBulkMessage: (options: BulkSendOptions) => { success: boolean; deliveredCount: number; message?: string };
  markMessagesAsRead: (conversationId: string) => void;
  pendingActionsCount: number;
  pendingMarketerRequestsCount: number;

  // Modal for Not Posted
  notPostedModal: {
    isOpen: boolean;
    conversationId: string | null;
    messageId: string | null;
    campaignName?: string;
  };
  openNotPostedModal: (conversationId: string, messageId: string, campaignName?: string) => void;
  closeNotPostedModal: () => void;

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
    const saved = localStorage.getItem('marketpulse_users_v3');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        // Ensure both fixed demo accounts exist with correct roles
        const adminFound = parsed.some((u) => u.email.toLowerCase() === 'admin@marketingapp.com');
        const marketerFound = parsed.some((u) => u.email.toLowerCase() === 'marketer@marketingapp.com');
        if (adminFound && marketerFound) return parsed;
      } catch {
        // Fallback to INITIAL_USERS
      }
    }
    return INITIAL_USERS;
  });

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
          images: m.images ? m.images.map((img) => resolveImageUrl(img)) : undefined,
          imageUrl: m.imageUrl ? resolveImageUrl(m.imageUrl) : undefined
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
      return merged;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  // Notifications state (Keyed by userId)
  const [notificationsMap, setNotificationsMap] = useState<Record<string, NotificationItem[]>>(() => {
    const saved = localStorage.getItem('marketpulse_notifications_v4');
    if (!saved) return INITIAL_NOTIFICATIONS;
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
      return merged;
    } catch {
      return INITIAL_NOTIFICATIONS;
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
    localStorage.setItem('marketpulse_conversations_v4', JSON.stringify(conversationsMap));
  }, [conversationsMap]);

  useEffect(() => {
    localStorage.setItem('marketpulse_notifications_v4', JSON.stringify(notificationsMap));
  }, [notificationsMap]);

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
    return notificationsMap[currentUserId] || [];
  }, [notificationsMap, currentUserId]);

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

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: currentUserId,
        type: 'posted',
        title: 'Content Marked as Posted',
        description: `"${title}" was marked as Posted. Action locked.`,
        timestamp: 'Just now',
        read: false,
        conversationId,
        messageId
      };

      setNotificationsMap((prev) => ({
        ...prev,
        [currentUserId]: [newNotif, ...(prev[currentUserId] || [])]
      }));

      showToast(`✓ Marked as Posted: "${title}"`, 'success');
    },
    [currentUserId, conversationsMap, showToast]
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

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: currentUserId,
        type: 'not_posted',
        title: 'Content Marked Not Posted',
        description: `"${title}" held with reason: ${reason}.`,
        timestamp: 'Just now',
        read: false,
        conversationId,
        messageId
      };

      setNotificationsMap((prev) => ({
        ...prev,
        [currentUserId]: [newNotif, ...(prev[currentUserId] || [])]
      }));

      showToast(`Saved as Not Posted: ${reason}`, 'info');
    },
    [currentUserId, conversationsMap, showToast]
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
      if ((!hasText && !hasImages) || !currentUserId || !currentUser) return;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isAdmin = currentUser.role === 'Admin';
      const category = options?.category;
      const attachedImages = options?.images || [];

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

        // Add broadcast notification to all marketers
        setNotificationsMap((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((uid) => {
            if (uid !== 'user-admin') {
              const notif: NotificationItem = {
                id: `notif-${Date.now()}-${uid}`,
                userId: uid,
                type: 'content_required',
                title: `New Flyer: ${campaignName}`,
                description: `Admin broadcast a new flyer campaign. Review and post when ready.`,
                timestamp: timeStr,
                read: false,
                conversationId: 'conv-marketer-assigned'
              };
              next[uid] = [notif, ...(next[uid] || [])];
            }
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
                type: attachedImages.length > 0 ? 'creative' : 'text',
                contentCategory: 'personalized',
                recipientUserId: targetConvId,
                recipientName,
                campaignName: title,
                text: text.trim(),
                images: attachedImages,
                date: 'Today',
                timestamp: timeStr,
                isPostable: attachedImages.length > 0,
                postingStatus: attachedImages.length > 0 ? 'pending' : undefined,
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
                type: attachedImages.length > 0 ? 'creative' : 'text',
                contentCategory: 'personalized',
                recipientUserId: 'user-marketer',
                recipientName: 'Raphael Rivera Berríos',
                campaignName: title,
                text: text.trim(),
                images: attachedImages,
                date: 'Today',
                timestamp: timeStr,
                isPostable: attachedImages.length > 0,
                postingStatus: attachedImages.length > 0 ? 'pending' : undefined,
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

        // Add targeted notification only if delivered to user-marketer
        if (isRaphaelTarget) {
          setNotificationsMap((prev) => ({
            ...prev,
            'user-marketer': [
              {
                id: `notif-${Date.now()}`,
                userId: 'user-marketer',
                type: 'message',
                title: `New Personalized Message`,
                description: `Admin sent you personalized content: "${text.trim().slice(0, 35) || title}"`,
                timestamp: timeStr,
                read: false,
                conversationId: 'conv-marketer-assigned'
              },
              ...(prev['user-marketer'] || [])
            ]
          }));
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
          setNotificationsMap((prev) => ({
            ...prev,
            'user-marketer': [
              {
                id: `notif-${Date.now()}`,
                userId: 'user-marketer',
                type: 'message',
                title: 'New Message',
                description: `Admin: "${text.trim().slice(0, 50) || 'Sent a message'}"`,
                timestamp: timeStr,
                read: false,
                conversationId: 'conv-marketer-assigned'
              },
              ...(prev['user-marketer'] || [])
            ]
          }));
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
    [currentUserId, currentUser, showToast]
  );

  const sendBulkMessage = useCallback(
    (options: BulkSendOptions): { success: boolean; deliveredCount: number; message?: string } => {
      const { category, title, text, images = [], recipientConversationIds } = options;
      const hasContent = Boolean(title?.trim() || text.trim() || images.length > 0);
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
      const isPostableContent = category === 'flyer' || (category !== 'normal' && attachedImages.length > 0);

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
            type: attachedImages.length > 0 ? 'creative' : 'text',
            contentCategory: category,
            campaignId,
            campaignName: campaignTitle,
            text: text.trim(),
            images: attachedImages,
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
              type: attachedImages.length > 0 ? 'creative' : 'text',
              contentCategory: category,
              campaignId,
              campaignName: campaignTitle,
              text: text.trim(),
              images: attachedImages,
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

      // 3. Notifications
      if (targetsRaphael) {
        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          userId: 'user-marketer',
          type: category === 'flyer' ? 'content_required' : 'message',
          title: `New ${categoryLabel}: ${campaignTitle}`,
          description:
            text.trim() ||
            (category === 'flyer'
              ? 'Admin delivered a new flyer deliverable.'
              : category === 'personalized'
                ? 'Admin delivered personalized instructions.'
                : 'Admin sent a normal message.'),
          timestamp: timeStr,
          read: false,
          conversationId: 'conv-marketer-assigned'
        };

        setNotificationsMap((prev) => ({
          ...prev,
          'user-marketer': [notif, ...(prev['user-marketer'] || [])]
        }));
      }

      showToast(
        `✓ Content successfully delivered to ${targetConvs.length} marketer${targetConvs.length > 1 ? 's' : ''}!`,
        'success'
      );

      return { success: true, deliveredCount: targetConvs.length };
    },
    [currentUserId, currentUser, conversationsMap, showToast]
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
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

      setNotificationsMap((prev) => ({
        ...prev,
        [userId]: [
          {
            id: `notif-approved-${Date.now()}`,
            userId,
            type: 'approval_update',
            title: 'Account Approved',
            description:
              'Your marketer account has been approved. You can now access Conversations and start working.',
            timestamp: timeStr,
            read: false
          },
          ...(prev[userId] || [])
        ]
      }));

      showToast('Marketer account approved — they can now log in and work.', 'success');
    },
    [currentUserId, showToast]
  );

  const rejectMarketer = useCallback(
    (userId: string, reason?: string) => {
      const nowIso = new Date().toISOString();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const rejectionReason = reason || 'Application declined by operations.';

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

      setNotificationsMap((prev) => ({
        ...prev,
        [userId]: [
          {
            id: `notif-rejected-${Date.now()}`,
            userId,
            type: 'approval_update',
            title: 'Registration Not Approved',
            description: rejectionReason,
            timestamp: timeStr,
            read: false
          },
          ...(prev[userId] || [])
        ]
      }));

      showToast('Marketer account rejected', 'info');
    },
    [currentUserId, showToast]
  );

  const completeTour = useCallback(() => {
    if (!currentUserId) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUserId ? { ...u, hasCompletedTour: true } : u))
    );
  }, [currentUserId]);

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
      const newUser: User = {
        ...newUserData,
        id: newId,
        role: 'Marketer',
        company: 'BrandPulse Agency',
        approvalStatus: 'pending',
        hasCompletedTour: false,
        registeredAt: newUserData.registeredAt || new Date().toISOString()
      };

      setUsers((prev) => [...prev, newUser]);
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
          {
            id: `notif-welcome-${newId}`,
            userId: newId,
            type: 'content_required',
            title: 'Posting Action Required',
            description: '3 flyers delivered in Weekly Social Media Creatives awaiting action.',
            timestamp: 'Just now',
            read: false,
            conversationId: `conv-raphael-${newId}`,
            messageId: `msg-welcome-trio-${newId}`
          }
        ]
      }));

      // Return user to login screen (Do NOT auto-login or switch)
      setAuthView('login');
      showToast('Account created successfully. Please login to continue.', 'success');
      return true;
    },
    [showToast]
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
        activeTab,
        setActiveTab,
        activeConversationId,
        targetMessageId,
        setTargetMessageId,
        openConversation,
        closeConversation,
        conversations,
        activeConversation,
        getMessageAction,
        markAsPosted,
        markAsNotPosted,
        sendMessage,
        sendBulkMessage,
        markMessagesAsRead,
        pendingActionsCount,
        pendingMarketerRequestsCount,
        notPostedModal,
        openNotPostedModal,
        closeNotPostedModal,
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
