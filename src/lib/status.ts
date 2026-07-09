import type { CandidateStatus } from './types';

export const STATUS_LABELS: Record<CandidateStatus, string> = {
  APPLIED: 'Applied',
  FORM_SUBMITTED: 'Form Submitted',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  OFFER_SENT: 'Offer Sent',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
};

export const STATUS_STYLES: Record<CandidateStatus, string> = {
  APPLIED: 'bg-slate-100 text-slate-700 ring-slate-200',
  FORM_SUBMITTED: 'bg-blue-50 text-blue-700 ring-blue-100',
  INTERVIEW_SCHEDULED: 'bg-violet-50 text-violet-700 ring-violet-100',
  OFFER_SENT: 'bg-amber-50 text-amber-700 ring-amber-100',
  HIRED: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  REJECTED: 'bg-red-50 text-red-700 ring-red-100',
};

export const ALL_STATUSES: CandidateStatus[] = [
  'APPLIED',
  'FORM_SUBMITTED',
  'INTERVIEW_SCHEDULED',
  'OFFER_SENT',
  'HIRED',
  'REJECTED',
];
