import { Lead, LeadSubmissionStatus } from '../types';

export const LEAD_LOCK_MS = 24 * 60 * 60 * 1000;

export const LEAD_SUBMISSION_STATUSES: {
  id: LeadSubmissionStatus;
  label: string;
}[] = [
  { id: 'new', label: 'New' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'rejected', label: 'Rejected' }
];

export function normalizeLead(lead: Lead): Lead {
  return {
    ...lead,
    submissionStatus: lead.submissionStatus || 'new'
  };
}

/** After 24h from createdAt, marketer can no longer edit/delete. */
export function isLeadLocked(lead: Pick<Lead, 'createdAt'>, now = Date.now()): boolean {
  const created = new Date(lead.createdAt).getTime();
  if (Number.isNaN(created)) return true;
  return now - created >= LEAD_LOCK_MS;
}

export function leadLockRemainingMs(
  lead: Pick<Lead, 'createdAt'>,
  now = Date.now()
): number {
  const created = new Date(lead.createdAt).getTime();
  if (Number.isNaN(created)) return 0;
  return Math.max(0, created + LEAD_LOCK_MS - now);
}

export function formatLeadLockHint(lead: Pick<Lead, 'createdAt'>, now = Date.now()): string {
  if (isLeadLocked(lead, now)) return 'Locked — edit/delete closed after 24h';
  const ms = leadLockRemainingMs(lead, now);
  const hrs = Math.ceil(ms / (60 * 60 * 1000));
  if (hrs <= 1) return 'Editable · locks in under 1h';
  return `Editable · locks in ~${hrs}h`;
}

export function submissionStatusLabel(status: LeadSubmissionStatus | undefined): string {
  const id = status || 'new';
  return LEAD_SUBMISSION_STATUSES.find((s) => s.id === id)?.label || 'New';
}
