'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { AdminPageSkeleton } from '@/components/ui/skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !getToken()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router]);

  if (loading || !getToken()) {
    return (
      <AdminShell>
        <AdminPageSkeleton />
      </AdminShell>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
