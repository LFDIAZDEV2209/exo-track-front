'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState } from 'react';
import { Loader2, Eye, EyeOff, User, Lock } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { loginAction } from '../actions';

export function LoginForm() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(loginAction, { error: '' });

  const {
    register,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (state.redirectUrl) {
      if (state.token) {
        const maxAge = 60 * 60 * 24 * 7;
        const isProd = process.env.NODE_ENV === 'production';
        const secure = isProd ? '; secure' : '';
        document.cookie = `auth_token=${state.token}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
      }
      window.location.href = state.redirectUrl;
    } else if (state.error) {
      toast({
        title: 'Error de autenticación',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state.redirectUrl, state.error, state.token, toast]);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="cedula" className="text-sm font-medium">
          Cédula
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="cedula"
            placeholder="Ingresa tu número de cédula"
            {...register('cedula')}
            autoFocus
            disabled={isPending}
            className="h-11 bg-muted/30 border-border/50 focus-visible:bg-background transition-all pl-10"
          />
        </div>
        {errors.cedula && (
          <p className="text-xs text-destructive animate-fade-in-up">
            {errors.cedula.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Ingresa tu contraseña"
            {...register('password')}
            disabled={isPending}
            className="h-11 bg-muted/30 border-border/50 focus-visible:bg-background transition-all pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive animate-fade-in-up">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/30"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          'Iniciar Sesión'
        )}
      </Button>
    </form>
  );
}
