import { User } from '../types';

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
