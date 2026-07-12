'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { ClienteSidebar } from '@/shared/layout/customer-sidebar';
import { Header } from '@/shared/layout/header';
import { useAuthStore } from '@/stores/auth-store';
import { UserRole } from '@/types/user-role.type';
import { Loader2 } from 'lucide-react';

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const { user: currentUser, initializeAuth } = useAuthStore.getState();
      if (!currentUser) {
        try {
          await initializeAuth();
        } catch (error) {
          console.error('Failed to restore session:', error);
        }
      }
      if (cancelled) return;

      const state = useAuthStore.getState();
      if (!state.isAuthenticated || state.user?.role !== UserRole.USER) {
        redirect('/login');
        return;
      }

      setIsChecking(false);
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
