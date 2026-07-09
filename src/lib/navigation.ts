import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  UserPlus,
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const mainNav: NavItem[] = [
  { label: 'Pipeline', href: '/', icon: LayoutDashboard },
  { label: 'Job Openings', href: '/jobs', icon: Briefcase },
  { label: 'Interviews', href: '/interviews', icon: CalendarDays },
  { label: 'Add Candidate', href: '/candidates/new', icon: UserPlus },
];

export const pageTitles: Record<string, string> = {
  '/': 'Candidate Pipeline',
  '/jobs': 'Job Openings',
  '/jobs/new': 'Create Job Opening',
  '/interviews': 'Interviews',
  '/candidates/new': 'Add Candidate',
};

export function getPageTitle(pathname: string) {
  if (pathname.startsWith('/candidates/') && pathname !== '/candidates/new') {
    return 'Candidate Profile';
  }
  return pageTitles[pathname] ?? 'ROVE Hire';
}
