'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';

type ApplyState =
  | { loading: true }
  | { expired: true }
  | { used: true; name: string; jobTitle: string }
  | { ready: true; name: string; email: string; jobTitle: string }
  | { submitted: true }
  | { error: string };

export default function ApplyPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<ApplyState>({ loading: true });
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<{
      expired: boolean;
      used: boolean;
      candidate: { name: string; email?: string; jobTitle: string } | null;
    }>(`/apply/${token}`)
      .then((data) => {
        if (data.expired) {
          setState({ expired: true });
        } else if (data.used && data.candidate) {
          setState({ used: true, name: data.candidate.name, jobTitle: data.candidate.jobTitle });
        } else if (data.candidate) {
          setState({
            ready: true,
            name: data.candidate.name,
            email: data.candidate.email ?? '',
            jobTitle: data.candidate.jobTitle,
          });
        }
      })
      .catch((err) => setState({ error: err instanceof ApiError ? err.message : 'Invalid link' }));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch(`/apply/${token}`, {
        method: 'POST',
        body: JSON.stringify({
          phone,
          location,
          currentRole,
          noticePeriod,
          salaryExpectation,
          linkedinUrl: linkedinUrl || undefined,
        }),
      });
      setState({ submitted: true });
    } catch (err) {
      setState({ error: err instanceof ApiError ? err.message : 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  }

  if ('loading' in state && state.loading) {
    return <Centered message="Loading application..." />;
  }

  if ('expired' in state && state.expired) {
    return (
      <Centered
        title="This link has expired"
        message="Please contact ROVE HR to request a new application link."
      />
    );
  }

  if ('used' in state && state.used) {
    return (
      <Centered
        title="Application already submitted"
        message={`Thanks ${state.name}! Your application for ${state.jobTitle} is on file.`}
      />
    );
  }

  if ('submitted' in state && state.submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-4 text-2xl font-semibold text-foreground">Application submitted!</h1>
          <p className="mt-2 text-sm text-muted">
            Thank you for completing your application. The ROVE team will be in touch soon.
          </p>
        </div>
      </div>
    );
  }

  if ('error' in state && state.error) {
    return <Centered title="Something went wrong" message={state.error} />;
  }

  if (!('ready' in state) || !state.ready) return null;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
            RH
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Complete your application</h1>
          <p className="mt-2 text-sm text-muted">
            {state.name} · {state.jobTitle}
          </p>
          <p className="text-xs text-muted">{state.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {[
            ['Phone number', phone, setPhone, 'tel'],
            ['Current location', location, setLocation, 'text'],
            ['Current role', currentRole, setCurrentRole, 'text'],
            ['Notice period', noticePeriod, setNoticePeriod, 'text'],
            ['Salary expectation', salaryExpectation, setSalaryExpectation, 'text'],
            ['LinkedIn URL (optional)', linkedinUrl, setLinkedinUrl, 'url'],
          ].map(([label, value, setter, type]) => (
            <div key={label as string}>
              <label className="mb-1.5 block text-sm font-medium">{label as string}</label>
              <input
                type={type as string}
                value={value as string}
                onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                required={label !== 'LinkedIn URL (optional)'}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit application'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Centered({ title, message }: { title?: string; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
        {title && <h1 className="text-xl font-semibold text-foreground">{title}</h1>}
        <p className={`text-sm text-muted ${title ? 'mt-2' : ''}`}>{message}</p>
      </div>
    </div>
  );
}
