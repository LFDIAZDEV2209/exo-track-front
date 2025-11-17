'use client';

import { Card } from '@/shared/ui/card';
import { ThemeToggle } from '@/shared/components/theme-toggle';
import { LoginHeader } from './components/LoginHeader';
import { LoginForm } from './components/LoginForm';
import { LoginCredentials } from './components/LoginCredentials';

export function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <Card className="shadow-xl">
        <LoginHeader />
        <LoginForm />
        <div className="px-6 pb-6">
          <LoginCredentials />
        </div>
      </Card>
    </div>
  );
}

