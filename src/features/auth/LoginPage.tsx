'use client';

import { ThemeToggle } from '@/shared/components/theme-toggle';
import { LoginForm } from './components/LoginForm';

export function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold text-xl shadow-lg shadow-emerald-500/20 mb-4">
              E
            </div>
            <h1 className="text-xl font-bold tracking-tight">ExoTrack</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sistema de Gestión de Declaraciones de Renta
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; 2026 ExoTrack. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
