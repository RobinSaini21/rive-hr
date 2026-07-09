const activities = [
  {
    name: "Sarah Mitchell",
    action: "submitted leave request",
    department: "Engineering",
    time: "12 min ago",
    status: "Pending",
  },
  {
    name: "James Chen",
    action: "completed onboarding",
    department: "Sales",
    time: "1 hr ago",
    status: "Completed",
  },
  {
    name: "Priya Sharma",
    action: "updated profile details",
    department: "Marketing",
    time: "2 hrs ago",
    status: "Completed",
  },
  {
    name: "Michael Torres",
    action: "requested payroll adjustment",
    department: "Finance",
    time: "3 hrs ago",
    status: "Review",
  },
  {
    name: "Emily Watson",
    action: "joined as new hire",
    department: "Operations",
    time: "5 hrs ago",
    status: "Completed",
  },
];

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-50 text-warning ring-amber-100",
  Completed: "bg-emerald-50 text-success ring-emerald-100",
  Review: "bg-blue-50 text-primary ring-blue-100",
};

export function RecentActivity() {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="font-semibold text-foreground">Recent Activity</h2>
          <p className="text-sm text-muted">Latest HR actions across the organization</p>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          View all
        </button>
      </div>
      <div className="divide-y divide-border">
        {activities.map((item) => (
          <div
            key={`${item.name}-${item.time}`}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                {item.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.name}{" "}
                  <span className="font-normal text-muted">{item.action}</span>
                </p>
                <p className="text-xs text-muted">
                  {item.department} · {item.time}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[item.status]}`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
