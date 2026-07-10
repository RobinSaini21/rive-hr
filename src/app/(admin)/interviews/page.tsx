'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { apiFetch } from '@/lib/api';
import { InterviewsTableSkeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/hire/status-badge';
import type { Interview } from '@/lib/types';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Interview[]>('/interviews')
      .then(setInterviews)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">All scheduled and completed interviews, sorted by date.</p>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        {loading ? (
          <InterviewsTableSkeleton />
        ) : interviews.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted">No interviews scheduled yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/80 text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Candidate</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Interviewer</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {interviews.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4 text-muted">
                    {format(new Date(i.scheduledAt), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-foreground">{i.candidate?.name}</p>
                    <p className="text-xs text-muted">{i.candidate?.jobOpening?.title}</p>
                  </td>
                  <td className="px-5 py-4 capitalize text-muted">{i.type.toLowerCase()}</td>
                  <td className="px-5 py-4 text-muted">{i.interviewerName}</td>
                  <td className="px-5 py-4">
                    {i.candidate && <StatusBadge status={i.candidate.status} />}
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
