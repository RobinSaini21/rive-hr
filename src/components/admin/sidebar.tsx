"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { mainNav, type NavItem } from "@/lib/navigation";

function NavLink({ href, label, icon: Icon }: NavItem) {
  const pathname = usePathname();
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-white/10 text-white shadow-sm"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon
        className={`h-[18px] w-[18px] shrink-0 ${
          isActive ? "text-blue-300" : "text-slate-400 group-hover:text-slate-200"
        }`}
      />
      <span>{label}</span>
      {isActive && <ChevronRight className="ml-auto h-4 w-4 text-blue-300" />}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-sidebar text-white">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white shadow-lg">
          RH
        </div>
        <div>
          <p className="text-sm font-semibold leading-none tracking-wide">ROVE Hire</p>
          <p className="mt-1 text-xs text-slate-400">Recruitment Console</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Hiring
        </p>
        {mainNav.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-xs font-medium text-slate-300">Internal tool</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            Manage candidates from application to offer.
          </p>
        </div>
      </div>
    </aside>
  );
}
