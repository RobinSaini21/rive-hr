'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import {
  Copy,
  Check,
  Download,
  Calendar,
  FileText,
} from 'lucide-react';
import { apiFetch, ApiError, downloadFile } from '@/lib/api';
import { StatusBadge } from '@/components/hire/status-badge';
import type { Candidate, FeedbackRecommendation } from '@/lib/types';

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch<Candidate>(`/candidates/${id}`);
      setCandidate(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function copyLink() {
    if (!candidate?.magicLinkUrl) return;
    await navigator.clipboard.writeText(candidate.magicLinkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="p-12 text-center text-sm text-muted">Loading profile...</div>;
  if (error || !candidate) return <div className="p-12 text-center text-sm text-danger">{error || 'Not found'}</div>;

  const canGenerateOffer = ['INTERVIEW_SCHEDULED', 'OFFER_SENT'].includes(candidate.status);
  const canHire = candidate.status !== 'HIRED' && candidate.status !== 'REJECTED';
  const canReject = candidate.status !== 'HIRED' && candidate.status !== 'REJECTED';
  const hasOffer = candidate.documents.some((d) => d.type === 'OFFER_LETTER');

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{candidate.name}</h2>
              <p className="mt-1 text-sm text-muted">{candidate.email}</p>
              <p className="mt-1 text-sm text-muted">{candidate.jobOpening?.title}</p>
            </div>
            <StatusBadge status={candidate.status} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['Phone', candidate.phone],
              ['Location', candidate.location],
              ['Current role', candidate.currentRole],
              ['Notice period', candidate.noticePeriod],
              ['Salary expectation', candidate.salaryExpectation],
              ['LinkedIn', candidate.linkedinUrl],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
                <p className="mt-1 text-sm text-foreground">{value || '—'}</p>
              </div>
            ))}
          </div>

          {candidate.magicLinkUrl && !candidate.magicLinkUsed && (
            <div className="mt-6 rounded-lg border border-dashed border-border bg-background p-4">
              <p className="text-sm font-medium text-foreground">Magic application link</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate text-xs">{candidate.magicLinkUrl}</code>
                <button type="button" onClick={copyLink} className="rounded-md border border-border p-2 hover:bg-slate-50">
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-semibold text-foreground">Documents</h3>
          </div>
          <div className="divide-y divide-border">
            {candidate.documents.length === 0 ? (
              <p className="p-5 text-sm text-muted">No documents yet.</p>
            ) : (
              candidate.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{doc.fileName}</p>
                      <p className="text-xs text-muted">{doc.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadFile(doc.id, doc.fileName)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-semibold text-foreground">Interviews</h3>
          </div>
          <div className="divide-y divide-border">
            {candidate.interviews.length === 0 ? (
              <p className="p-5 text-sm text-muted">No interviews scheduled.</p>
            ) : (
              candidate.interviews.map((i) => (
                <InterviewRow key={i.id} interview={i} onComplete={load} />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="font-semibold text-foreground">Actions</h3>
          <div className="mt-4 space-y-2">
            {showSchedule ? (
              <ScheduleForm
                candidateId={candidate.id}
                onDone={() => { setShowSchedule(false); load(); }}
                onCancel={() => setShowSchedule(false)}
              />
            ) : (
              <ActionButton icon={Calendar} label="Schedule interview" onClick={() => setShowSchedule(true)} disabled={candidate.status === 'HIRED' || candidate.status === 'REJECTED'} />
            )}
            {canGenerateOffer && (
              showOffer ? (
                <OfferForm candidate={candidate} onDone={() => { setShowOffer(false); load(); }} onCancel={() => setShowOffer(false)} />
              ) : (
                <ActionButton icon={FileText} label="Generate offer documents" onClick={() => setShowOffer(true)} />
              )
            )}
            {canHire && (
              <button
                type="button"
                disabled={!hasOffer || actionLoading}
                onClick={async () => {
                  setActionLoading(true);
                  try {
                    await apiFetch(`/candidates/${candidate.id}/hire`, { method: 'POST' });
                    load();
                  } finally { setActionLoading(false); }
                }}
                className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Mark as Hired
              </button>
            )}
            {canReject && (
              showReject ? (
                <RejectForm candidateId={candidate.id} onDone={() => { setShowReject(false); load(); }} onCancel={() => setShowReject(false)} />
              ) : (
                <button type="button" onClick={() => setShowReject(true)} className="flex w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-danger hover:bg-red-100">
                  Reject Candidate
                </button>
              )
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-semibold text-foreground">Timeline</h3>
          </div>
          <div className="space-y-0 divide-y divide-border">
            {candidate.timelineEvents.map((e) => (
              <div key={e.id} className="px-5 py-4">
                <p className="text-sm font-medium text-foreground">{e.title}</p>
                {e.description && <p className="mt-1 text-xs text-muted">{e.description}</p>}
                <p className="mt-1 text-xs text-muted">{format(new Date(e.createdAt), 'MMM d, yyyy h:mm a')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, disabled }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </button>
  );
}

function ScheduleForm({ candidateId, onDone, onCancel }: { candidateId: string; onDone: () => void; onCancel: () => void }) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [type, setType] = useState<'SCREENING' | 'TECHNICAL'>('SCREENING');
  const [interviewerName, setInterviewerName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await apiFetch(`/candidates/${candidateId}/interviews`, {
      method: 'POST',
      body: JSON.stringify({ scheduledAt, type, interviewerName, notes }),
    });
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-border bg-background p-3">
      <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="h-9 w-full rounded border border-border px-2 text-sm" required />
      <select value={type} onChange={(e) => setType(e.target.value as 'SCREENING' | 'TECHNICAL')} className="h-9 w-full rounded border border-border px-2 text-sm">
        <option value="SCREENING">Screening</option>
        <option value="TECHNICAL">Technical</option>
      </select>
      <input value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} placeholder="Interviewer name" className="h-9 w-full rounded border border-border px-2 text-sm" required />
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full rounded border border-border px-2 py-1 text-sm" />
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="flex-1 rounded bg-primary py-1.5 text-xs font-medium text-white">Schedule</button>
        <button type="button" onClick={onCancel} className="rounded border border-border px-3 py-1.5 text-xs">Cancel</button>
      </div>
    </form>
  );
}

function OfferForm({ candidate, onDone, onCancel }: { candidate: Candidate; onDone: () => void; onCancel: () => void }) {
  const [roleTitle, setRoleTitle] = useState(candidate.jobOpening?.title ?? '');
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [managerName, setManagerName] = useState('');
  const [location, setLocation] = useState(candidate.location ?? '');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await apiFetch(`/candidates/${candidate.id}/offer-documents`, {
      method: 'POST',
      body: JSON.stringify({
        roleTitle,
        salaryCurrency,
        salaryAmount: Number(salaryAmount),
        startDate,
        managerName,
        location,
      }),
    });
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-border bg-background p-3">
      <input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Role title" className="h-9 w-full rounded border border-border px-2 text-sm" required />
      <div className="flex gap-2">
        <input value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.target.value)} className="h-9 w-20 rounded border border-border px-2 text-sm" required />
        <input type="number" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} placeholder="Salary" className="h-9 flex-1 rounded border border-border px-2 text-sm" required />
      </div>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 w-full rounded border border-border px-2 text-sm" required />
      <input value={managerName} onChange={(e) => setManagerName(e.target.value)} placeholder="Reporting manager" className="h-9 w-full rounded border border-border px-2 text-sm" required />
      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="h-9 w-full rounded border border-border px-2 text-sm" required />
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="flex-1 rounded bg-primary py-1.5 text-xs font-medium text-white">Generate PDFs</button>
        <button type="button" onClick={onCancel} className="rounded border border-border px-3 py-1.5 text-xs">Cancel</button>
      </div>
    </form>
  );
}

function RejectForm({ candidateId, onDone, onCancel }: { candidateId: string; onDone: () => void; onCancel: () => void }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await apiFetch(`/candidates/${candidateId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-red-200 bg-red-50/50 p-3">
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rejection reason" rows={3} className="w-full rounded border border-border px-2 py-1 text-sm" required />
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="flex-1 rounded bg-danger py-1.5 text-xs font-medium text-white">Confirm reject</button>
        <button type="button" onClick={onCancel} className="rounded border border-border px-3 py-1.5 text-xs">Cancel</button>
      </div>
    </form>
  );
}

function InterviewRow({ interview, onComplete }: { interview: Candidate['interviews'][0]; onComplete: () => void }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [recommendation, setRecommendation] = useState<FeedbackRecommendation>('HIRE');
  const [note, setNote] = useState('');

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    await apiFetch(`/interviews/${interview.id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ recommendation, note }),
    });
    setShowFeedback(false);
    onComplete();
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium capitalize">{interview.type.toLowerCase()} interview</p>
          <p className="text-xs text-muted">{format(new Date(interview.scheduledAt), 'MMM d, yyyy h:mm a')}</p>
          <p className="text-xs text-muted">With {interview.interviewerName}</p>
          {interview.feedbackRecommendation && (
            <p className="mt-2 text-xs text-muted">
              Feedback: {interview.feedbackRecommendation.replace('_', ' ')}
              {interview.feedbackNote ? ` — ${interview.feedbackNote}` : ''}
            </p>
          )}
        </div>
        {interview.status === 'SCHEDULED' && !showFeedback && (
          <button type="button" onClick={() => setShowFeedback(true)} className="text-xs font-medium text-primary">Mark complete</button>
        )}
      </div>
      {showFeedback && (
        <form onSubmit={submitFeedback} className="mt-3 space-y-2 rounded border border-border bg-background p-3">
          <select value={recommendation} onChange={(e) => setRecommendation(e.target.value as FeedbackRecommendation)} className="h-8 w-full rounded border border-border px-2 text-xs">
            <option value="HIRE">Hire</option>
            <option value="NO_HIRE">No hire</option>
            <option value="MAYBE">Maybe</option>
          </select>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Feedback note" rows={2} className="w-full rounded border border-border px-2 py-1 text-xs" />
          <button type="submit" className="rounded bg-primary px-3 py-1 text-xs font-medium text-white">Save feedback</button>
        </form>
      )}
    </div>
  );
}
