import {
  ReferralDownlineEntry,
  ReferralNetworkSummary,
  User
} from '../types';

const REF_STORAGE_KEY = 'marketpulse_pending_ref_v1';

/** Short shareable code from name + id (stable per user). */
export function buildReferralCode(user: Pick<User, 'id' | 'name'>): string {
  const base = (user.name || 'mkt')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 6)
    .toUpperCase();
  const suffix = user.id.replace(/\D/g, '').slice(-4) || '1000';
  return `${base || 'MKT'}${suffix}`;
}

export function ensureReferralCode(user: User): User {
  if (user.role !== 'Marketer') return user;
  if (user.referralCode) return user;
  return { ...user, referralCode: buildReferralCode(user) };
}

export function ensureAllReferralCodes(users: User[]): User[] {
  const used = new Set<string>();
  return users.map((u) => {
    const next = ensureReferralCode(u);
    if (!next.referralCode) return next;
    let code = next.referralCode;
    let i = 1;
    while (used.has(code.toUpperCase())) {
      code = `${next.referralCode}${i}`;
      i += 1;
    }
    used.add(code.toUpperCase());
    return code === next.referralCode ? next : { ...next, referralCode: code };
  });
}

export function findUserByReferralCode(
  users: User[],
  code: string | null | undefined
): User | undefined {
  if (!code?.trim()) return undefined;
  const clean = code.trim().toUpperCase();
  return users.find(
    (u) => u.role === 'Marketer' && (u.referralCode || '').toUpperCase() === clean
  );
}

export function getReferralLink(code: string): string {
  if (typeof window === 'undefined') return `?ref=${code}`;
  const url = new URL(window.location.href);
  url.searchParams.set('ref', code);
  // Drop hash noise; keep path for Vite base
  url.hash = '';
  return url.toString();
}

export function readRefFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref')?.trim();
  return ref || null;
}

export function persistPendingRef(code: string | null) {
  if (typeof window === 'undefined') return;
  if (!code) {
    localStorage.removeItem(REF_STORAGE_KEY);
    return;
  }
  localStorage.setItem(REF_STORAGE_KEY, code.trim().toUpperCase());
}

export function loadPendingRef(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REF_STORAGE_KEY);
}

export function clearPendingRef() {
  persistPendingRef(null);
}

export type ReferralNode = {
  user: User;
  children: ReferralNode[];
  directCount: number;
  totalCount: number;
};

/** Direct referrals of a marketer. */
export function getDirectReferrals(users: User[], marketerId: string): User[] {
  return users.filter(
    (u) => u.role === 'Marketer' && u.referredByUserId === marketerId
  );
}

/** Build nested tree under root marketer. */
export function buildReferralTree(users: User[], rootId: string): ReferralNode | null {
  const root = users.find((u) => u.id === rootId);
  if (!root) return null;

  const build = (id: string): ReferralNode => {
    const user = users.find((u) => u.id === id)!;
    const kids = getDirectReferrals(users, id);
    const children = kids.map((k) => build(k.id));
    const directCount = children.length;
    const totalCount =
      directCount + children.reduce((sum, c) => sum + c.totalCount, 0);
    return { user, children, directCount, totalCount };
  };

  return build(rootId);
}

/**
 * All referral roots for admin overview:
 * marketers with no referrer, or whose referrer is missing from the user list.
 */
export function buildReferralForest(users: User[]): ReferralNode[] {
  const marketers = users.filter((u) => u.role === 'Marketer');
  const ids = new Set(marketers.map((u) => u.id));
  const roots = marketers.filter(
    (u) => !u.referredByUserId || !ids.has(u.referredByUserId)
  );
  return roots
    .map((r) => buildReferralTree(users, r.id))
    .filter((n): n is ReferralNode => Boolean(n))
    .sort((a, b) => b.totalCount - a.totalCount || a.user.name.localeCompare(b.user.name));
}

export function countReferralEdges(users: User[]): number {
  const ids = new Set(users.filter((u) => u.role === 'Marketer').map((u) => u.id));
  return users.filter(
    (u) =>
      u.role === 'Marketer' &&
      Boolean(u.referredByUserId) &&
      ids.has(u.referredByUserId!)
  ).length;
}

/**
 * Flatten a marketer's downline into direct + indirect rows
 * (depth 1 = direct; depth 2+ = indirect). Sorted newest first.
 */
export function getReferralDownline(
  users: User[],
  marketerId: string
): ReferralDownlineEntry[] {
  const byId = new Map(users.map((u) => [u.id, u]));
  const entries: ReferralDownlineEntry[] = [];

  const walk = (parentId: string, depth: number) => {
    const kids = getDirectReferrals(users, parentId);
    const parent = byId.get(parentId);
    for (const kid of kids) {
      entries.push({
        user: kid,
        relation: depth === 1 ? 'direct' : 'indirect',
        depth,
        referredByUserId: parentId,
        referredByName: parent?.name || 'Unknown'
      });
      walk(kid.id, depth + 1);
    }
  };

  walk(marketerId, 1);

  return entries.sort((a, b) => {
    const ta = new Date(a.user.registeredAt || 0).getTime();
    const tb = new Date(b.user.registeredAt || 0).getTime();
    return tb - ta;
  });
}

export function getReferralNetworkSummary(
  users: User[],
  marketerId: string
): ReferralNetworkSummary {
  const downline = getReferralDownline(users, marketerId);
  const directCount = downline.filter((d) => d.relation === 'direct').length;
  const indirectCount = downline.filter((d) => d.relation === 'indirect').length;
  const totalReferralPoints = downline.reduce(
    (sum, d) => sum + (d.user.referralPoints || 0),
    0
  );
  return {
    directCount,
    indirectCount,
    totalNetwork: directCount + indirectCount,
    totalReferralPoints
  };
}
