"use client";

import { Bell, ChevronDown, LogOut } from "lucide-react";
import { getPageTitle } from "@/lib/navigation";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-6 backdrop-blur-sm">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          ROVE Hire
        </p>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted transition hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background py-1.5 pl-1.5 pr-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-semibold text-white">
              {user?.name?.slice(0, 2).toUpperCase() ?? "HR"}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none">{user?.name ?? "HR Admin"}</p>
              <p className="mt-0.5 text-xs text-muted">{user?.email ?? "hr@rove.com"}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted" />
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted transition hover:text-danger"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
