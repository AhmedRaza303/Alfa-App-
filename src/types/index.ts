export type PostingStatus = 'pending' | 'posted' | 'not_posted';

/** Chat posting-status filter chips (Stats deep-link + ConversationDetailView) */
export type ChatPostingFilter =
  | 'all'
  | PostingStatus
  | 'language_requested';

/** Chat category filter (Stats Content Distribution → Chat) */
export type ChatCategoryFilter = 'all' | 'flyer' | 'personalized' | 'others';

export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';

export type PostingReason =
  | 'Approval Pending'
  | 'Content Issue'
  | 'Incorrect Information'
  | 'Scheduling Issue'
  | 'Client Request'
  | 'Platform Issue'
  | 'Duplicate Content'
  | 'Other';

export type UserRole = 'Admin' | 'Marketer';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type AppLanguage = 'en' | 'es';

export type FlyerLanguage = 'en' | 'es';

/** Languages a marketer can request — same as app (English & Spanish only) */
export type RequestableContentLanguage = FlyerLanguage;

export interface LanguageContentRequest {
  id: string;
  userId: string;
  userName: string;
  conversationId: string;
  messageId: string;
  campaignName?: string;
  /** Language the original message is already in */
  sourceLanguage: RequestableContentLanguage;
  requestedLanguage: RequestableContentLanguage;
  requestedLanguageLabel: string;
  notes?: string;
  createdAt: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
}

export type FlyerCategory =
  | 'work_injury'
  | 'car_accident'
  | 'truck_accident'
  | 'motorcycle_accident'
  | 'slip_fall'
  | 'workers_comp'
  | 'medical_malpractice'
  | 'product_liability'
  | 'dog_bite'
  | 'wrongful_death';

export type ContentCategory = 'flyer' | 'personalized' | 'normal';

/** Admin-managed pipeline status for a captured lead */
export type LeadSubmissionStatus = 'new' | 'in_progress' | 'rejected';

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  accidentType: FlyerCategory;
  notes: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  /** Admin updates this; defaults to new */
  submissionStatus: LeadSubmissionStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneCountryCode?: string;
  instagram?: string;
  avatar: string;
  password?: string;
  role: UserRole;
  company?: string;
  // Approval workflow
  approvalStatus: ApprovalStatus;
  registeredAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  // Preferences & Location
  applicationLanguage?: AppLanguage;
  preferredFlyerLanguage?: FlyerLanguage;
  preferredFlyerCategories?: FlyerCategory[];
  country?: string;
  countryCode?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  // Referral network
  referralCode?: string;
  referredByUserId?: string;
  /**
   * Future incentive hook — not awarded in UI yet.
   * Reserved so bonus/reward programs can attach points without schema churn.
   */
  referralPoints?: number;
  // Onboarding
  /** @deprecated Prefer completedTourPages — kept for migration of older accounts */
  hasCompletedTour?: boolean;
  /** Pages whose first-visit Quick Tour the user already finished or skipped */
  completedTourPages?: TourPage[];
  /**
   * Sample account for Quick Tour testing — first-time completion is not enforced;
   * page tours can reopen every login for this user only.
   */
  isTourDemo?: boolean;
}

/** Marketer tabs that have a first-visit Quick Tour */
export type TourPage =
  | 'conversations'
  | 'leads'
  | 'performance'
  | 'referrals'
  | 'notifications';

export const TOUR_PAGES: TourPage[] = [
  'conversations',
  'leads',
  'performance',
  'referrals',
  'notifications'
];

/** Direct = personally onboarded; Indirect = downline of directs */
export type ReferralRelationType = 'direct' | 'indirect';

export interface ReferralDownlineEntry {
  user: User;
  relation: ReferralRelationType;
  /** 1 = direct, 2+ = indirect depth */
  depth: number;
  referredByUserId: string;
  referredByName: string;
}

export interface ReferralNetworkSummary {
  directCount: number;
  indirectCount: number;
  totalNetwork: number;
  /** Reserved for future rewards programs */
  totalReferralPoints: number;
}

export interface MessageAction {
  id: string;
  userId: string;
  conversationId: string;
  messageId: string;
  status: PostingStatus;
  reason?: PostingReason | string;
  comments?: string;
  timestamp: string;
  postedAt?: string;
}

export type ReactionEmoji = '👍' | '❤️' | '🔥' | '👏' | '✅' | '😂';

export interface MessageReaction {
  emoji: ReactionEmoji;
  userId: string;
  userName: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isSenderMe?: boolean;
  type: 'text' | 'creative';
  text: string;
  date?: string; // e.g. 'Yesterday', 'Today'
  timestamp: string;
  isPostable?: boolean;
  campaignName?: string;
  platformTarget?: string;
  images?: string[]; // Array of 1, 2, or 3 flyer images
  imageUrl?: string; // For single image convenience
  videos?: string[]; // Personalized video attachments (typically 1)
  caption?: string;
  scheduledTime?: string;
  notes?: string;
  isRead?: boolean;
  deliveryStatus?: DeliveryStatus;
  postingStatus?: PostingStatus;
  contentCategory?: ContentCategory;
  campaignId?: string;
  recipientUserId?: string;
  recipientName?: string;
  reactions?: MessageReaction[];
  /** Language this deliverable was sent in (defaults to English) */
  contentLanguage?: FlyerLanguage;
}

export interface Conversation {
  id: string;
  userId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  senderCompany: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export type NotificationType =
  | 'new_message'
  | 'message_update'
  | 'lead_update'
  | 'team_application'
  | 'message'
  | 'content_required'
  | 'posted'
  | 'not_posted'
  | 'action_reminder'
  | 'approval_update';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  /** Human-readable time label shown in the Alerts list */
  timestamp: string;
  /** ISO datetime used for chronological sorting */
  createdAt: string;
  read: boolean;
  conversationId?: string;
  messageId?: string;
  leadId?: string;
  /** Referred team member (for team_application alerts) */
  relatedUserId?: string;
}

export type ActiveTab =
  | 'conversations'
  | 'bulk_sender'
  | 'content_calendar'
  | 'marketer_requests'
  | 'analytics'
  | 'performance'
  | 'referrals'
  | 'leads'
  | 'help'
  | 'notifications'
  | 'profile';

export type ScheduledSendStatus = 'scheduled' | 'sent' | 'cancelled';

export interface ScheduledSend {
  id: string;
  category: ContentCategory;
  title: string;
  text: string;
  images: string[];
  videos?: string[];
  recipientConversationIds: string[];
  recipientLabel: string;
  scheduledFor: string; // ISO datetime
  status: ScheduledSendStatus;
  createdAt: string;
  sentAt?: string;
}

export interface BulkSendOptions {
  category: ContentCategory;
  title?: string;
  text: string;
  images?: string[];
  videos?: string[];
  recipientConversationIds: string[]; // conversation IDs or 'all'
  /** Language of this deliverable (English or Spanish) */
  contentLanguage?: FlyerLanguage;
  /** Skip success toast (used by scheduled dispatch) */
  silent?: boolean;
}

export interface ScheduleBulkSendOptions {
  category: ContentCategory;
  title?: string;
  text: string;
  images?: string[];
  videos?: string[];
  recipientConversationIds: string[];
  recipientLabel: string;
  scheduledFor: string; // ISO datetime
}
