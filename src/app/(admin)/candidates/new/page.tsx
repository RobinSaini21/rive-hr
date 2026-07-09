'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type { JobOpening } from '@/lib/types';

export default function AddCandidatePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobOpeningId, setJobOpeningId] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [magicLink, setMagicLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<JobOpening[]>('/jobs').then((data) => {
      setJobs(data.filter((j) => j.status === 'OPEN'));
      if (data[0]) setJobOpeningId(data.find((j) => j.status === 'OPEN')?.id ?? '');
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resume) {
      setError('Resume PDF is required');
      return;
    }

    setLoading(true);
    setError('');
    const form = new FormData();
    form.append('name', name);
    form.append('email', email);
    form.append('jobOpeningId', jobOpeningId);
    form.append('resume', resume);

    try {
      const data = await apiFetch<{ magicLinkUrl: string; id: string }>('/candidates', {
        method: 'POST',
        body: form,
      });
      setMagicLink(data.magicLinkUrl);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add candidate');
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(magicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (magicLink) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Candidate added</h2>
        <p className="mt-2 text-sm text-muted">
          Share this magic link with the candidate to complete their application.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background p-3">
          <code className="flex-1 truncate text-xs text-foreground">{magicLink}</code>
          <button
            type="button"
            onClick={copyLink}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-slate-50"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-6 h-10 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Back to pipeline
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Job opening</label>
          <select
            value={jobOpeningId}
            onChange={(e) => setJobOpeningId(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            required
          >
            <option value="">Select opening...</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Resume (PDF, max 10MB)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setResume(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
            required
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {loading ? 'Adding...' : 'Add Candidate'}
        </button>
      </form>
    </div>
  );
}
