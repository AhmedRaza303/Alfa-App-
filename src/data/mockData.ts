import { User, Conversation, NotificationItem, MessageAction, Lead } from '../types';
import { ONLINE_FLYER_URLS } from '../utils/imageAssets';

const { autumnPromo, productLaunch, eventSummit, promoSale } = ONLINE_FLYER_URLS;

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Admin',
    email: 'admin@marketingapp.com',
    phone: '+1 (555) 720-4100',
    phoneCountryCode: '+1',
    instagram: '@admin.pulse',
    password: 'Admin@123',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    role: 'Admin',
    company: 'Alfa Operations',
    approvalStatus: 'approved',
    hasCompletedTour: true,
    country: 'United States',
    countryCode: 'US'
  },
  {
    id: 'user-marketer',
    name: 'Raphael Rivera Berríos',
    email: 'marketer@marketingapp.com',
    phone: '+1 (555) 382-9011',
    phoneCountryCode: '+1',
    instagram: '@raphael.campaigns',
    password: 'Marketer@123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    role: 'Marketer',
    company: 'BrandPulse Agency',
    approvalStatus: 'approved',
    hasCompletedTour: true,
    preferredFlyerLanguage: 'en',
    preferredFlyerCategories: ['work_injury', 'car_accident', 'slip_fall'],
    country: 'United States',
    countryCode: 'US',
    state: 'California',
    city: 'Los Angeles',
    postalCode: '90012',
    registeredAt: '2026-10-01T10:00:00Z',
    referralCode: 'RAPHAEL01'
  },
  {
    id: 'user-pending-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@vanguard.com',
    phone: '612 345 678',
    phoneCountryCode: '+34',
    instagram: '@elena.socials',
    password: 'Marketer@123',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    role: 'Marketer',
    company: 'Vanguard Creative',
    approvalStatus: 'pending',
    hasCompletedTour: false,
    preferredFlyerLanguage: 'es',
    preferredFlyerCategories: ['car_accident', 'motorcycle_accident', 'truck_accident'],
    country: 'Spain',
    countryCode: 'ES',
    state: 'Madrid',
    city: 'Madrid',
    postalCode: '28001',
    registeredAt: '2026-10-12T14:30:00Z',
    referralCode: 'ELENA01',
    referredByUserId: 'user-marketer'
  },
  {
    id: 'user-pending-2',
    name: 'Marcus Thorne',
    email: 'marcus.thorne@apex.co',
    phone: '7911 123456',
    phoneCountryCode: '+44',
    instagram: '@marcus.marketing',
    password: 'Marketer@123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    role: 'Marketer',
    company: 'Apex Promotions',
    approvalStatus: 'pending',
    hasCompletedTour: false,
    preferredFlyerLanguage: 'en',
    preferredFlyerCategories: ['work_injury', 'workers_comp', 'medical_malpractice'],
    country: 'United Kingdom',
    countryCode: 'GB',
    state: 'England',
    city: 'London',
    postalCode: '10001',
    registeredAt: '2026-10-13T02:15:00Z',
    referralCode: 'MARCUS01',
    referredByUserId: 'user-pending-1'
  },
  {
    id: 'user-rejected-1',
    name: 'Carlos Mendez',
    email: 'carlos.mendez@promo.net',
    phone: '55 1234 5678',
    phoneCountryCode: '+52',
    instagram: '@carlos.ambassador',
    password: 'Marketer@123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    role: 'Marketer',
    company: 'Mendez Media',
    approvalStatus: 'rejected',
    hasCompletedTour: false,
    preferredFlyerLanguage: 'es',
    preferredFlyerCategories: ['dog_bite', 'product_liability'],
    country: 'Mexico',
    countryCode: 'MX',
    state: 'Ciudad de México',
    city: 'CDMX',
    postalCode: '01000',
    registeredAt: '2026-10-10T09:00:00Z',
    rejectionReason: 'Invalid agency verification credentials',
    referralCode: 'CARLOS01',
    referredByUserId: 'user-marketer'
  },
  {
    id: 'user-ref-sara',
    name: 'Sara Kim',
    email: 'sara.kim@outreach.io',
    phone: '555 010 8899',
    phoneCountryCode: '+1',
    instagram: '@sara.outreach',
    password: 'Marketer@123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    role: 'Marketer',
    company: 'Outreach IO',
    approvalStatus: 'approved',
    hasCompletedTour: true,
    preferredFlyerLanguage: 'en',
    preferredFlyerCategories: ['slip_fall', 'car_accident'],
    country: 'United States',
    countryCode: 'US',
    state: 'New York',
    city: 'New York',
    postalCode: '10001',
    registeredAt: '2026-10-05T12:00:00Z',
    referralCode: 'SARA01',
    referredByUserId: 'user-marketer'
  }
];

export const REASON_OPTIONS = [
  'Approval Pending',
  'Content Issue',
  'Incorrect Information',
  'Scheduling Issue',
  'Client Request',
  'Platform Issue',
  'Duplicate Content',
  'Other'
];

export const INITIAL_ACTIONS: Record<string, MessageAction> = {
  // Key format: `${userId}_${messageId}`
  // Message 4: Posted content
  'user-admin_msg-demo-4': {
    id: 'act-demo-4',
    userId: 'user-admin',
    conversationId: 'conv-raphael-ali',
    messageId: 'msg-demo-4',
    status: 'posted',
    postedAt: 'Yesterday at 02:45 PM',
    timestamp: 'Yesterday at 02:45 PM'
  },
  'user-marketer_msg-demo-4': {
    id: 'act-demo-4-m',
    userId: 'user-marketer',
    conversationId: 'conv-marketer-assigned',
    messageId: 'msg-demo-4',
    status: 'posted',
    postedAt: 'Yesterday at 02:45 PM',
    timestamp: 'Yesterday at 02:45 PM'
  },
  // Message 6: Posted content
  'user-admin_msg-demo-6': {
    id: 'act-demo-6',
    userId: 'user-admin',
    conversationId: 'conv-raphael-ali',
    messageId: 'msg-demo-6',
    status: 'posted',
    postedAt: 'Yesterday at 07:45 PM',
    timestamp: 'Yesterday at 07:45 PM'
  },
  'user-marketer_msg-demo-6': {
    id: 'act-demo-6-m',
    userId: 'user-marketer',
    conversationId: 'conv-marketer-assigned',
    messageId: 'msg-demo-6',
    status: 'posted',
    postedAt: 'Yesterday at 07:45 PM',
    timestamp: 'Yesterday at 07:45 PM'
  },
  // Message 5: Not Posted content
  'user-admin_msg-demo-5': {
    id: 'act-demo-5',
    userId: 'user-admin',
    conversationId: 'conv-raphael-ali',
    messageId: 'msg-demo-5',
    status: 'not_posted',
    reason: 'Approval Pending',
    comments: 'Waiting for client approval.',
    timestamp: 'Yesterday at 04:15 PM'
  },
  'user-marketer_msg-demo-5': {
    id: 'act-demo-5-m',
    userId: 'user-marketer',
    conversationId: 'conv-marketer-assigned',
    messageId: 'msg-demo-5',
    status: 'not_posted',
    reason: 'Approval Pending',
    comments: 'Waiting for client approval.',
    timestamp: 'Yesterday at 04:15 PM'
  },
  // Sarah's actions
  'user-admin_msg-sarah-2': {
    id: 'act-sarah-2',
    userId: 'user-admin',
    conversationId: 'conv-sarah-ali',
    messageId: 'msg-sarah-2',
    status: 'posted',
    postedAt: 'Yesterday at 11:45 AM',
    timestamp: 'Yesterday at 11:45 AM'
  },
  // Michael's actions
  'user-admin_msg-michael-2': {
    id: 'act-michael-2',
    userId: 'user-admin',
    conversationId: 'conv-michael-ali',
    messageId: 'msg-michael-2',
    status: 'posted',
    postedAt: 'Yesterday at 10:45 AM',
    timestamp: 'Yesterday at 10:45 AM'
  },
  'user-admin_msg-michael-3': {
    id: 'act-michael-3',
    userId: 'user-admin',
    conversationId: 'conv-michael-ali',
    messageId: 'msg-michael-3',
    status: 'not_posted',
    reason: 'Scheduling Issue',
    comments: 'Rescheduled per brand manager directive.',
    timestamp: 'Yesterday at 04:00 PM'
  }
};

const DEMO_CONVERSATIONS: Conversation[] = [
    {
      id: 'conv-raphael-ali',
      userId: 'user-ali',
      senderId: 'contact-raphael',
      senderName: 'Raphael Rivera Berríos',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      senderRole: 'Marketer',
      senderCompany: 'Horizon Studio',
      isOnline: true,
      lastMessage: 'Here are the creatives for this week\'s campaign. 3 flyers in package.',
      lastMessageTime: '10:52 PM',
      unreadCount: 2,
      messages: [
        // Message 1: Marketer greeting (Received from Raphael -> Left for Admin, Right for Marketer)
        {
          id: 'msg-demo-1',
          conversationId: 'conv-raphael-ali',
          senderId: 'contact-raphael',
          senderName: 'Raphael Rivera Berríos',
          senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
          type: 'text',
          text: 'Good morning Admin! Ready for this week\'s campaign rollout. Please share each content delivery as the assets arrive.',
          date: 'Yesterday',
          timestamp: '10:15 AM',
          isPostable: false,
          isRead: true
        },

        // Message 4: Posted content (Sent by Admin -> Right for Admin, Left for Marketer)
        {
          id: 'msg-demo-4',
          conversationId: 'conv-raphael-ali',
          senderId: 'user-admin',
          senderName: 'Admin',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
          type: 'creative',
          text: 'Flash promo creative approved by brand legal. Ready for distribution.',
          date: 'Yesterday',
          timestamp: '08:45 AM',
          isPostable: true,
          contentCategory: 'flyer',
          campaignId: 'camp-demo-4',
          campaignName: 'Flash Promo - Special Edition',
          platformTarget: 'Instagram & Facebook',
          images: [productLaunch, autumnPromo, promoSale],
          caption: 'Ready for distribution.',
          scheduledTime: '08:45 AM',
          isRead: true
        },

        // Message 5: Not Posted content with Reason = Approval Pending (Sent by Admin -> Right for Admin, Left for Marketer)
        {
          id: 'msg-demo-5',
          conversationId: 'conv-raphael-ali',
          senderId: 'user-admin',
          senderName: 'Admin',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
          type: 'creative',
          text: 'Regional Webinar announcement flyer. Scheduled for enterprise network.',
          date: 'Yesterday',
          timestamp: '09:15 AM',
          isPostable: true,
          contentCategory: 'flyer',
          campaignId: 'camp-demo-5',
          campaignName: 'Regional Webinar announcement flyer.',
          platformTarget: 'Scheduled for enterprise network.',
          images: [eventSummit, productLaunch, autumnPromo],
          caption: 'Scheduled for enterprise network.',
          scheduledTime: '09:15 AM',
          isRead: true
        },

        // Message: Normal reply from marketer (Sent by Raphael -> Left for Admin, Right for Marketer)
        {
          id: 'msg-demo-reply',
          conversationId: 'conv-raphael-ali',
          senderId: 'contact-raphael',
          senderName: 'Raphael Rivera Berríos',
          senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
          type: 'text',
          text: 'Received Admin. The webinar asset is held for client approval. Send over the rest of the week’s bundle.',
          date: 'Yesterday',
          timestamp: '04:45 PM',
          isPostable: false,
          deliveryStatus: 'read'
        },

        // Message 6: Product Launch creative (Sent by Admin -> Right for Admin, Left for Marketer)
        {
          id: 'msg-demo-6',
          conversationId: 'conv-raphael-ali',
          senderId: 'user-admin',
          senderName: 'Admin',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
          type: 'creative',
          text: 'Product launch teaser banner for social release.',
          date: 'Yesterday',
          timestamp: '09:20 AM',
          isPostable: true,
          contentCategory: 'flyer',
          campaignId: 'camp-demo-6',
          campaignName: 'Product launch teaser banner for social release.',
          platformTarget: 'Instagram & Threads',
          images: [promoSale, eventSummit, productLaunch],
          caption: 'Special release teaser for premier accounts.',
          scheduledTime: '09:20 AM',
          isRead: true
        },

        // Message 2: Four flyer images with +1 overlay (Sent by Admin -> Right for Admin, Left for Marketer)
        {
          id: 'msg-demo-2',
          conversationId: 'conv-raphael-ali',
          senderId: 'user-admin',
          senderName: 'Admin',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
          type: 'creative',
          text: 'Primary single flyer for the upcoming autumn launch.',
          date: 'Yesterday',
          timestamp: '10:52 PM',
          isPostable: true,
          contentCategory: 'flyer',
          campaignId: 'camp-demo-2',
          campaignName: 'Primary single flyer for the upcoming autumn launch.',
          platformTarget: 'Instagram Feed',
          images: [autumnPromo, productLaunch, eventSummit, promoSale],
          caption: 'Requires client approval.',
          scheduledTime: '10:52 PM',
          isRead: false
        },

        // Message 3: THREE FLYER IMAGES IN ONE MESSAGE (Sent by Admin -> Right for Admin, Left for Marketer)
        {
          id: 'msg-demo-3',
          conversationId: 'conv-raphael-ali',
          senderId: 'user-admin',
          senderName: 'Admin',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
          type: 'creative',
          text: 'Here are the creatives for this week\'s campaign. All three flyers belong to the multi-channel package.',
          date: 'Today',
          timestamp: '10:52 PM',
          isPostable: true,
          contentCategory: 'flyer',
          campaignId: 'camp-demo-3',
          campaignName: 'Weekly Social Media Creatives',
          platformTarget: 'Instagram, LinkedIn & Facebook',
          images: [
            promoSale,
            eventSummit,
            autumnPromo
          ],
          caption: 'Discover the complete trio for our September brand refresh. 3 creative assets bundled for unified cross-channel posting.',
          scheduledTime: '11:00 PM',
          notes: 'Single posting decision covers the full 3-flyer set.',
          isRead: false
        },

        // Follow-up sent message from marketer (Sent by Raphael -> Left for Admin, Right for Marketer)
        {
          id: 'msg-demo-sent-2',
          conversationId: 'conv-raphael-ali',
          senderId: 'contact-raphael',
          senderName: 'Raphael Rivera Berríos',
          senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
          type: 'text',
          text: 'Thanks Admin! Reviewing both flyer packages now.',
          date: 'Today',
          timestamp: '10:55 PM',
          isPostable: false,
          deliveryStatus: 'delivered'
        },

        // Message 7: Personalized deliverable sent by Admin for Raphael (Sent by Admin -> Right for Admin, Left for Marketer)
        {
          id: 'msg-demo-pers-1',
          conversationId: 'conv-raphael-ali',
          senderId: 'user-admin',
          senderName: 'Admin',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
          type: 'creative',
          contentCategory: 'personalized',
          recipientUserId: 'contact-raphael',
          recipientName: 'Raphael Rivera Berríos',
          campaignName: 'VIP Ambassador Promo',
          platformTarget: 'Instagram Stories & Direct',
          images: [promoSale],
          text: 'Hi Raphael, here is your personalized VIP campaign deliverable for this week. Please review your custom affiliate promo code before posting.',
          caption: 'Custom affiliate promo code for Raphael.',
          date: 'Today',
          timestamp: '11:15 AM',
          isPostable: true,
          postingStatus: 'pending',
          isRead: true
        }
      ]
    },
    {
      id: 'conv-sarah-ali',
      userId: 'user-ali',
      senderId: 'contact-sarah',
      senderName: 'Sarah Ahmed',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
      senderRole: 'Content Strategist',
      senderCompany: 'Apex Digital',
      isOnline: true,
      lastMessage: 'Here are the updated designs for the Autumn Campaign.',
      lastMessageTime: 'Yesterday',
      unreadCount: 1,
      messages: [
        {
          id: 'msg-sarah-1',
          conversationId: 'conv-sarah-ali',
          senderId: 'contact-sarah',
          senderName: 'Sarah Ahmed',
          senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
          type: 'text',
          text: 'Hi Admin, sharing ready check-in for the seasonal push.',
          date: 'Yesterday',
          timestamp: '08:30 AM',
          isPostable: false,
          isRead: true
        },
        {
          id: 'msg-sarah-2',
          conversationId: 'conv-sarah-ali',
          senderId: 'user-admin',
          senderName: 'Admin',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
          type: 'creative',
          contentCategory: 'flyer',
          text: 'Here are the updated designs for the Autumn Campaign.',
          date: 'Yesterday',
          timestamp: '11:15 AM',
          isPostable: true,
          campaignName: 'Autumn Season Launch Suite',
          platformTarget: 'Instagram & Pinterest',
          images: [
            autumnPromo,
            productLaunch
          ],
          caption: 'Welcoming the new autumn collection with fresh colorways and refined layout aesthetics.',
          scheduledTime: '11:30 AM',
          isRead: true
        },
        {
          id: 'msg-sarah-3',
          conversationId: 'conv-sarah-ali',
          senderId: 'contact-sarah',
          senderName: 'Sarah Ahmed',
          senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
          type: 'text',
          text: 'Great work! Posted the primary set to Instagram and Pinterest.',
          date: 'Yesterday',
          timestamp: '01:20 PM',
          isPostable: false,
          deliveryStatus: 'read'
        },
        {
          id: 'msg-sarah-4',
          conversationId: 'conv-sarah-ali',
          senderId: 'user-admin',
          senderName: 'Admin',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
          type: 'creative',
          contentCategory: 'flyer',
          text: 'Adding the VIP Early Access flyer for member exclusive announcement.',
          date: 'Yesterday',
          timestamp: '04:40 PM',
          isPostable: true,
          campaignName: 'VIP Early Access Flyer',
          platformTarget: 'Facebook & Email Newsletter',
          images: [promoSale],
          caption: 'Early access doors open for registered subscribers tomorrow morning.',
          scheduledTime: '05:00 PM',
          isRead: false
        }
      ]
    },
    {
      id: 'conv-michael-ali',
      userId: 'user-ali',
      senderId: 'contact-michael',
      senderName: 'Michael James',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      senderRole: 'Brand Ambassador',
      senderCompany: 'Nova Media',
      isOnline: false,
      lastMessage: 'Please review the latest post for product launch.',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      messages: [
        {
          id: 'msg-michael-1',
          conversationId: 'conv-michael-ali',
          senderId: 'contact-michael',
          senderName: 'Michael James',
          senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
          type: 'text',
          text: 'Hey Admin, checking in for today\'s ambassador deliverables.',
          date: 'Yesterday',
          timestamp: '09:00 AM',
          isPostable: false,
          isRead: true
        },
        {
          id: 'msg-michael-2',
          conversationId: 'conv-michael-ali',
          senderId: 'user-admin',
          senderName: 'Admin',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
          type: 'creative',
          contentCategory: 'flyer',
          text: 'Product launch spotlight teaser banner for release.',
          date: 'Yesterday',
          timestamp: '10:15 AM',
          isPostable: true,
          campaignName: 'Product Launch Spotlight',
          platformTarget: 'LinkedIn & YouTube Community',
          images: [productLaunch],
          caption: 'Spotlight on our next-generation toolkit built for high-performance marketing teams.',
          scheduledTime: '10:30 AM',
          isRead: true
        },
        {
          id: 'msg-michael-3',
          conversationId: 'conv-michael-ali',
          senderId: 'user-admin',
          senderName: 'Admin',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
          type: 'creative',
          contentCategory: 'flyer',
          text: 'Alternative discount card graphic for regional affiliate channels.',
          date: 'Yesterday',
          timestamp: '03:30 PM',
          isPostable: true,
          campaignName: 'Affiliate Discount Card',
          platformTarget: 'Affiliate Portals',
          images: [promoSale],
          caption: 'Special 15% discount voucher code for partner networks.',
          scheduledTime: '04:00 PM',
          isRead: true
        }
      ]
    },
    {
      id: 'conv-elena-ali',
      userId: 'user-ali',
      senderId: 'contact-elena',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      senderRole: 'Social Media Specialist',
      senderCompany: 'Vanguard Creative',
      isOnline: false,
      lastMessage: 'All scheduled weekend promos have been queued up.',
      lastMessageTime: '2 days ago',
      unreadCount: 0,
      messages: [
        {
          id: 'msg-elena-1',
          conversationId: 'conv-elena-ali',
          senderId: 'contact-elena',
          senderName: 'Elena Rostova',
          senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
          type: 'text',
          text: 'Good afternoon Admin! Just syncing on weekly copy updates.',
          date: '2 days ago',
          timestamp: '02:00 PM',
          isPostable: false,
          isRead: true
        },
        {
          id: 'msg-elena-2',
          conversationId: 'conv-elena-ali',
          senderId: 'contact-elena',
          senderName: 'Elena Rostova',
          senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
          type: 'text',
          text: 'All scheduled weekend promos have been queued up.',
          date: '2 days ago',
          timestamp: '04:30 PM',
          isPostable: false,
          isRead: true
        }
      ]
    }
  ];

export const INITIAL_CONVERSATIONS: Record<string, Conversation[]> = {
  'user-admin': DEMO_CONVERSATIONS.map((c) => ({
    ...c,
    userId: 'user-admin'
  })),
  'user-marketer': [
    // Marketer account has their own assigned conversation
    {
      ...DEMO_CONVERSATIONS[0],
      id: 'conv-marketer-assigned',
      userId: 'user-marketer',
      senderId: 'user-admin',
      senderName: 'Alfa Operations Admin',
      senderRole: 'Corporate Operations',
      senderCompany: 'MarketPulse Operations',
      messages: DEMO_CONVERSATIONS[0].messages.map((m) => ({
        ...m,
        conversationId: 'conv-marketer-assigned',
        ...(m.senderId === 'contact-raphael'
          ? { senderId: 'user-marketer', senderName: 'Raphael Rivera Berríos' }
          : { senderId: 'user-admin', senderName: 'Admin' })
      }))
    }
  ]
};

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-admin',
    type: 'content_required',
    title: 'Action Required: 3 New Flyers',
    description: 'Raphael delivered Weekly Social Media Creatives awaiting posting decision.',
    timestamp: '10:52 PM',
    read: false,
    conversationId: 'conv-raphael-ali',
    messageId: 'msg-demo-3'
  },
  {
    id: 'notif-2',
    userId: 'user-admin',
    type: 'not_posted',
    title: 'Content Marked Not Posted',
    description: 'Webinar announcement banner marked Not Posted (Approval Pending).',
    timestamp: '10:58 PM',
    read: false,
    conversationId: 'conv-raphael-ali',
    messageId: 'msg-demo-5'
  },
  {
    id: 'notif-3',
    userId: 'user-admin',
    type: 'posted',
    title: 'Content Verified as Posted',
    description: 'Flash Promo - Special Edition marked as Posted.',
    timestamp: '09:15 AM',
    read: true,
    conversationId: 'conv-raphael-ali',
    messageId: 'msg-demo-4'
  },
  {
    id: 'notif-4',
    userId: 'user-admin',
    type: 'content_required',
    title: 'Action Required: VIP Early Access Flyer',
    description: 'Sarah delivered VIP Early Access Flyer awaiting posting decision.',
    timestamp: 'Yesterday at 04:40 PM',
    read: false,
    conversationId: 'conv-sarah-ali',
    messageId: 'msg-sarah-4'
  }
];

export const INITIAL_NOTIFICATIONS: Record<string, NotificationItem[]> = {
  'user-admin': DEMO_NOTIFICATIONS,
  'user-marketer': [
    {
      ...DEMO_NOTIFICATIONS[0],
      id: 'notif-marketer-1',
      userId: 'user-marketer',
      conversationId: 'conv-marketer-assigned'
    },
    {
      ...DEMO_NOTIFICATIONS[1],
      id: 'notif-marketer-2',
      userId: 'user-marketer',
      conversationId: 'conv-marketer-assigned'
    }
  ]
};

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    fullName: 'James Carter',
    phone: '+1 (555) 204-1188',
    email: 'james.carter@email.com',
    accidentType: 'car_accident',
    notes: 'Rear-end collision on I-5. Interested in free consultation.',
    createdByUserId: 'user-marketer',
    createdByName: 'Raphael Rivera Berríos',
    createdAt: '2026-10-11T16:20:00Z'
  },
  {
    id: 'lead-2',
    fullName: 'Maria Lopez',
    phone: '+1 (555) 882-4410',
    email: 'maria.lopez@email.com',
    accidentType: 'slip_fall',
    notes: 'Fell at grocery store. Looking for Spanish-speaking attorney.',
    createdByUserId: 'user-marketer',
    createdByName: 'Raphael Rivera Berríos',
    createdAt: '2026-10-12T09:45:00Z'
  }
];
