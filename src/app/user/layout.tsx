'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { user, isAuthenticated, token, initializeAuth, _hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Esperar a que el store se haya rehidratado
    if (!_hasHydrated) {
      return;
    }

    const checkAuth = async () => {
      // Si hay token pero no hay usuario, intentar restaurar la sesión
      if (token && !user) {
        try {
          await initializeAuth();
        } catch (error) {
          console.error('Failed to restore session:', error);
        }
      }
      
      // Verificar autenticación y rol después de restaurar
      const currentState = useAuthStore.getState();
      if (!currentState.isAuthenticated || currentState.user?.role !== UserRole.USER) {
        router.push('/login');
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [_hasHydrated, token, user, router, initializeAuth]);

  // Mostrar loader mientras se rehidrata o verifica
  if (!_hasHydrated || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Verificar nuevamente después de la rehidratación
  const currentState = useAuthStore.getState();
  if (!currentState.isAuthenticated || currentState.user?.role !== UserRole.USER) {
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
