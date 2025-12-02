'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClienteSidebar } from '@/shared/layout/customer-sidebar';
import { Header } from '@/shared/layout/header';
import { useAuthStore } from '@/stores/auth-store';
import { UserRole } from '@/types/user-role.type';

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.USER) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== UserRole.USER) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ClienteSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
