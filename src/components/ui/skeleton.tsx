import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200/80', className)}
      aria-hidden
    />
  );
}

export function TableRowsSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <tr key={row} className="border-b border-border last:border-0">
          {Array.from({ length: columns }).map((__, col) => (
            <td key={col} className="px-5 py-4">
              <Skeleton
                className={cn(
                  'h-4',
                  col === 0 ? 'w-36' : col === columns - 1 ? 'w-24' : 'w-28',
                )}
              />
              {col === 0 && <Skeleton className="mt-2 h-3 w-44" />}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function PipelineTableSkeleton() {
  return (
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
        <TableRowsSkeleton rows={6} columns={4} />
      </tbody>
    </table>
  );
}

export function InterviewsTableSkeleton() {
  return (
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
        <TableRowsSkeleton rows={5} columns={5} />
      </tbody>
    </table>
  );
}

export function JobsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-2/3 max-w-md" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="ml-auto h-8 w-10" />
              <Skeleton className="ml-auto h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CandidateProfileSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>

        <PanelSkeleton titleWidth="w-24" rows={2} />
        <PanelSkeleton titleWidth="w-28" rows={2} />
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <Skeleton className="h-5 w-16" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <PanelSkeleton titleWidth="w-20" rows={4} />
      </div>
    </div>
  );
}

function PanelSkeleton({
  titleWidth,
  rows,
}: {
  titleWidth: string;
  rows: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <Skeleton className={cn('h-5', titleWidth)} />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ApplyFormSkeleton() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-xl" />
          <Skeleton className="mx-auto mt-4 h-8 w-64" />
          <Skeleton className="mx-auto mt-2 h-4 w-48" />
          <Skeleton className="mx-auto mt-2 h-3 w-40" />
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <PipelineTableSkeleton />
      </div>
    </div>
  );
}
