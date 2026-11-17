import { NotificationItem, NotificationType, User } from '../types';

/** Upline referrers from nearest (direct) to farthest */
export function getReferrerUplineIds(users: User[], userId: string): string[] {
  const byId = new Map(users.map((u) => [u.id, u]));
  const ids: string[] = [];
  let cur = byId.get(userId);
  let guard = 0;
  while (cur?.referredByUserId && guard < 20) {
    ids.push(cur.referredByUserId);
    cur = byId.get(cur.referredByUserId);
    guard += 1;
  }
  return ids;
}

export function formatNotificationClock(date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatNotificationWhen(iso?: string, fallback?: string): string {
  if (!iso) return fallback || 'Just now';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return fallback || 'Just now';

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round((startToday.getTime() - startThat.getTime()) / 86400000);
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (dayDiff === 0) return `Today · ${time}`;
  if (dayDiff === 1) return `Yesterday · ${time}`;
  if (dayDiff > 1 && dayDiff < 7) {
    return `${d.toLocaleDateString([], { weekday: 'short' })} · ${time}`;
  }
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${time}`;
}

export function buildNotification(
  partial: Omit<NotificationItem, 'id' | 'createdAt' | 'timestamp' | 'read'> & {
    id?: string;
    createdAt?: string;
    timestamp?: string;
    read?: boolean;
  }
): NotificationItem {
  const createdAt = partial.createdAt || new Date().toISOString();
  return {
    ...partial,
    id: partial.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt,
    timestamp: partial.timestamp || formatNotificationWhen(createdAt),
    read: partial.read ?? false
  };
}

/** Unread first, then newest → oldest */
export function sortNotifications(items: NotificationItem[]): NotificationItem[] {
  return [...items].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
}

export function normalizeNotification(n: NotificationItem): NotificationItem {
  const createdAt =
    n.createdAt ||
    // Best-effort for older seeded rows without ISO
    new Date().toISOString();
  return {
    ...n,
    createdAt,
    timestamp: formatNotificationWhen(createdAt, n.timestamp)
  };
}

export function notificationCategoryLabel(type: NotificationType): string {
  switch (type) {
    case 'new_message':
    case 'message':
    case 'content_required':
      return 'New message';
    case 'message_update':
      return 'Message update';
    case 'lead_update':
      return 'Lead update';
    case 'team_application':
      return 'Team application';
    case 'approval_update':
      return 'Account';
    case 'posted':
      return 'Posted';
    case 'not_posted':
      return 'Need Revision';
    case 'action_reminder':
      return 'Reminder';
    default:
      return 'Alert';
  }
}
