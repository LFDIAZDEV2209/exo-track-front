'use client';

import Image from 'next/image';
import { ThemeToggle } from '@/shared/components/theme-toggle';
import { LoginForm } from './components/LoginForm';
import {
  ShieldCheck,
  FileText,
  BarChart3,
  Wallet,
  TrendingUp,
  Scale,
  Calculator,
  CheckCircle,
  Receipt,
  Landmark,
  BadgeDollarSign,
  FileCheck,
} from 'lucide-react';

const floatingIcons = [
  { Icon: ShieldCheck, className: 'top-8 left-[20%]', size: 18, delay: 0, duration: 6, boxSize: 11 },
  { Icon: FileText, className: 'top-[26%] left-[7%]', size: 16, delay: 0.8, duration: 7, boxSize: 10 },
  { Icon: BadgeDollarSign, className: 'top-[42%] left-[12%]', size: 17, delay: 0.6, duration: 5.5, boxSize: 11 },
  { Icon: Wallet, className: 'top-[58%] left-[8%]', size: 16, delay: 1.4, duration: 6.8, boxSize: 10 },
  { Icon: Calculator, className: 'bottom-24 left-[22%]', size: 15, delay: 1.0, duration: 5.8, boxSize: 10 },
  { Icon: BarChart3, className: 'top-12 right-[22%]', size: 20, delay: 0.4, duration: 6.5, boxSize: 12 },
  { Icon: TrendingUp, className: 'top-[24%] right-[6%]', size: 19, delay: 0.2, duration: 7.5, boxSize: 11 },
  { Icon: Scale, className: 'top-[40%] right-[14%]', size: 16, delay: 0.6, duration: 6, boxSize: 10 },
  { Icon: Landmark, className: 'top-[56%] right-[18%]', size: 18, delay: 0.3, duration: 6.3, boxSize: 11 },
  { Icon: Receipt, className: 'bottom-16 right-[7%]', size: 15, delay: 0.9, duration: 7.2, boxSize: 10 },
  { Icon: CheckCircle, className: 'top-[60%] right-[8%]', size: 14, delay: 0.5, duration: 6.8, boxSize: 9 },
  { Icon: FileCheck, className: 'bottom-32 left-[6%]', size: 16, delay: 1.1, duration: 6.2, boxSize: 10 },
];

const bgDots = Array.from({ length: 30 }, () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: 2 + Math.random() * 3,
  delay: Math.random() * 5,
  duration: 3 + Math.random() * 4,
}));

export function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/12 to-transparent rounded-full blur-3xl animate-float-slow" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-tl from-emerald-400/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      <div className="absolute top-1/3 -right-20 w-[350px] h-[350px] bg-gradient-to-bl from-emerald-600/7 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '-1.5s' }} />
      <div className="absolute bottom-1/4 -left-16 w-[280px] h-[280px] bg-gradient-to-tr from-emerald-500/8 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
      <div className="absolute top-1/4 left-1/3 w-[200px] h-[200px] bg-gradient-to-br from-emerald-400/6 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '-2s' }} />

      {bgDots.map((dot, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-emerald-400/15 pointer-events-none animate-twinkle"
          style={{
            left: dot.left,
            top: dot.top,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            animationDelay: `${dot.delay}s`,
            animationDuration: `${dot.duration}s`,
          }}
        />
      ))}

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="rounded-2xl border border-emerald-500/10 bg-card/80 backdrop-blur-xl shadow-xl shadow-emerald-500/5 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 blur-sm" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="ExoTrack"
                  fill
                  sizes="64px"
                  className="object-contain p-2"
                  priority
                />
              </div>
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

      {floatingIcons.map(({ Icon, className, size, delay, duration, boxSize }) => (
        <div
          key={className}
          className={`absolute ${className} pointer-events-none animate-float`}
          style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
        >
          <div
            className="flex items-center justify-center rounded-xl border border-emerald-500/10 bg-white/60 backdrop-blur-md shadow-lg shadow-emerald-500/5 dark:bg-emerald-950/40 dark:border-emerald-400/10"
            style={{ width: `${boxSize * 4}px`, height: `${boxSize * 4}px` }}
          >
            <Icon className="text-emerald-600/40 dark:text-emerald-300/40" size={size} />
          </div>
        </div>
      ))}
    </div>
  );
}
