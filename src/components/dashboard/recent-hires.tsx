const hires = [
  { name: "Emily Watson", role: "Operations Analyst", date: "Jul 8, 2026", status: "Active" },
  { name: "David Park", role: "Software Engineer", date: "Jul 5, 2026", status: "Active" },
  { name: "Lisa Nguyen", role: "Account Executive", date: "Jul 1, 2026", status: "Probation" },
  { name: "Robert Kim", role: "Finance Associate", date: "Jun 28, 2026", status: "Active" },
];

export function RecentHires() {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="font-semibold text-foreground">Recent Hires</h2>
          <p className="text-sm text-muted">New employees this month</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50/80 text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3 font-semibold">Employee</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Start Date</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {hires.map((hire) => (
              <tr key={hire.name} className="transition hover:bg-slate-50/50">
                <td className="px-5 py-3.5 font-medium text-foreground">{hire.name}</td>
                <td className="px-5 py-3.5 text-muted">{hire.role}</td>
                <td className="px-5 py-3.5 text-muted">{hire.date}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      hire.status === "Active"
                        ? "bg-emerald-50 text-success ring-emerald-100"
                        : "bg-amber-50 text-warning ring-amber-100"
                    }`}
                  >
                    {hire.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
