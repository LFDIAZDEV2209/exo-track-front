'use client';

import { Card } from '@/shared/ui/card';
import { ThemeToggle } from '@/shared/components/theme-toggle';
import { LoginHeader } from './components/LoginHeader';
import { LoginForm } from './components/LoginForm';

export function LoginPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-end animate-in fade-in slide-in-from-top-4 duration-300">
        <ThemeToggle />
      </div>

      <Card className="shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
        <LoginHeader />
        <LoginForm />
      </Card>
    </div>
  );
}

