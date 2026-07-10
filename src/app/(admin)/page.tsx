'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { ALL_STATUSES, STATUS_LABELS } from '@/lib/status';
import { StatusBadge } from '@/components/hire/status-badge';
import { PipelineTableSkeleton } from '@/components/ui/skeleton';
import type { CandidateListItem, CandidateStatus } from '@/lib/types';

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [status, setStatus] = useState<CandidateStatus | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search.trim()) params.set('search', search.trim());

    setLoading(true);
    apiFetch<CandidateListItem[]>(`/candidates?${params}`)
      .then(setCandidates)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">
            Track every candidate from application to offer.
          </p>
        </div>
        <Link
          href="/candidates/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Add Candidate
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or role..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as CandidateStatus | '')}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        {loading ? (
          <PipelineTableSkeleton />
        ) : error ? (
          <div className="p-12 text-center text-sm text-danger">{error}</div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-foreground">No candidates found</p>
            <p className="mt-1 text-sm text-muted">Try adjusting filters or add a new candidate.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/80 text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-semibold">Candidate</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {candidates.map((c) => (
                <tr key={c.id} className="transition hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <Link href={`/candidates/${c.id}`} className="group block">
                      <p className="font-medium text-foreground group-hover:text-primary">
                        {c.name}
                      </p>
                      <p className="text-xs text-muted">{c.email}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {c.jobOpening?.title ?? '—'}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {format(new Date(c.updatedAt), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
