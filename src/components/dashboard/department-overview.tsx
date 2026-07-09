const departments = [
  { name: "Engineering", headcount: 86, fill: 86 },
  { name: "Sales", headcount: 52, fill: 62 },
  { name: "Marketing", headcount: 34, fill: 45 },
  { name: "Operations", headcount: 41, fill: 52 },
  { name: "Finance", headcount: 18, fill: 24 },
  { name: "HR", headcount: 12, fill: 16 },
];

export function DepartmentOverview() {
  const max = Math.max(...departments.map((d) => d.headcount));

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-semibold text-foreground">Department Overview</h2>
        <p className="text-sm text-muted">Headcount distribution by department</p>
      </div>
      <div className="space-y-4 p-5">
        {departments.map((dept) => (
          <div key={dept.name}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{dept.name}</span>
              <span className="text-muted">{dept.headcount} employees</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400"
                style={{ width: `${(dept.headcount / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
