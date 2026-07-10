'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { JobsListSkeleton } from '@/components/ui/skeleton';
import type { JobOpening } from '@/lib/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<JobOpening[]>('/jobs')
      .then(setJobs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Manage open and closed job openings.</p>
        <Link
          href="/jobs/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Create Opening
        </Link>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <JobsListSkeleton />
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">{job.title}</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        job.status === 'OPEN'
                          ? 'bg-emerald-50 text-success'
                          : 'bg-slate-100 text-muted'
                      }`}
                    >
                      {job.status === 'OPEN' ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{job.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-foreground">
                    {job._count?.candidates ?? 0}
                  </p>
                  <p className="text-xs text-muted">candidates</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
