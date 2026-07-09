import { ArrowUpRight, UserPlus, FileCheck, CalendarClock } from "lucide-react";

const actions = [
  {
    label: "Add Employee",
    description: "Create a new employee record",
    icon: UserPlus,
    color: "bg-blue-50 text-primary",
  },
  {
    label: "Approve Leave",
    description: "Review pending leave requests",
    icon: CalendarClock,
    color: "bg-amber-50 text-warning",
  },
  {
    label: "Run Payroll",
    description: "Process monthly payroll cycle",
    icon: FileCheck,
    color: "bg-emerald-50 text-success",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-semibold text-foreground">Quick Actions</h2>
        <p className="text-sm text-muted">Common administrative tasks</p>
      </div>
      <div className="grid gap-3 p-4">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="flex w-full items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition hover:border-primary/30 hover:bg-blue-50/30"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.color}`}
            >
              <action.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="text-xs text-muted">{action.description}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted" />
          </button>
        ))}
      </div>
    </div>
  );
}
