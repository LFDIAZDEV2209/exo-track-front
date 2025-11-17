'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { CardContent } from '@/shared/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth-store';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { mockUsers } from '@/lib/mock-data';

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    // @ts-ignore - Type compatibility issue between zod and react-hook-form
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check credentials against mock data
    const user = mockUsers.find((u) => u.documentNumber === data.cedula);

    if (!user || data.password !== 'password123') {
      toast({
        title: 'Error de autenticación',
        description: 'Cédula o contraseña incorrecta',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Login successful
    login(user);
    toast({
      title: 'Bienvenido',
      description: `Has iniciado sesión como ${user.fullName}`,
    });

    // Redirect based on role
    if (user.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/user/home');
    }

    setIsLoading(false);
  };

  return (
    <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cedula">Cédula</Label>
          <Input
            id="cedula"
            placeholder="Ingresa tu cédula"
            {...register('cedula')}
            autoFocus
            disabled={isLoading}
          />
          {errors.cedula && (
            <p className="text-sm text-destructive">{errors.cedula.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </form>
    </CardContent>
  );
}

