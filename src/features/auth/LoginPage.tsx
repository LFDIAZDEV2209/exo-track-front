'use client';

import { Card } from '@/shared/ui/card';
import { ThemeToggle } from '@/shared/components/theme-toggle';
import { LoginHeader } from './components/LoginHeader';
import { LoginForm } from './components/LoginForm';

export function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <Card className="shadow-xl">
        <LoginHeader />
        <LoginForm />
      </Card>
    </div>
  );
}

