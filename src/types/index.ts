export type PostingStatus = 'pending' | 'posted' | 'not_posted';

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

export type FlyerCategory = 'work_injury' | 'car_accident';

export type ContentCategory = 'flyer' | 'personalized' | 'none';

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
  // Onboarding
  hasCompletedTour?: boolean;
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

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'message' | 'content_required' | 'posted' | 'not_posted' | 'action_reminder' | 'approval_update';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  conversationId?: string;
  messageId?: string;
}

export type ActiveTab =
  | 'conversations'
  | 'bulk_sender'
  | 'marketer_requests'
  | 'notifications'
  | 'profile';

export interface BulkSendOptions {
  category: ContentCategory;
  title?: string;
  text: string;
  images?: string[];
  recipientConversationIds: string[]; // conversation IDs or 'all'
}
