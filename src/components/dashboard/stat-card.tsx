import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-sm">
        <TrendIcon
          className={`h-4 w-4 ${trend === "up" ? "text-success" : "text-danger"}`}
        />
        <span
          className={`font-medium ${trend === "up" ? "text-success" : "text-danger"}`}
        >
          {change}
        </span>
        <span className="text-muted">vs last month</span>
      </div>
    </div>
  );
}
