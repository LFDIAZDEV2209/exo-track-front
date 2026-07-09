import { useEffect, useState, useRef } from 'react';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: 'emerald' | 'navy' | 'amber' | 'violet' | 'rose';
  animate?: boolean;
}

const variantStyles = {
  emerald: {
    gradient: 'from-emerald-500/20 to-emerald-600/10',
    iconBg: 'bg-emerald-500/15 text-emerald-600',
    iconBorder: 'border-emerald-500/25',
    trendUp: 'text-emerald-600',
    accent: 'bg-emerald-500',
    glow: 'shadow-emerald-500/10',
  },
  navy: {
    gradient: 'from-blue-600/20 to-indigo-600/10',
    iconBg: 'bg-blue-600/15 text-blue-600',
    iconBorder: 'border-blue-600/25',
    trendUp: 'text-blue-600',
    accent: 'bg-blue-600',
    glow: 'shadow-blue-600/10',
  },
  amber: {
    gradient: 'from-amber-500/20 to-orange-500/10',
    iconBg: 'bg-amber-500/15 text-amber-600',
    iconBorder: 'border-amber-500/25',
    trendUp: 'text-amber-600',
    accent: 'bg-amber-500',
    glow: 'shadow-amber-500/10',
  },
  violet: {
    gradient: 'from-violet-500/20 to-purple-600/10',
    iconBg: 'bg-violet-500/15 text-violet-600',
    iconBorder: 'border-violet-500/25',
    trendUp: 'text-violet-600',
    accent: 'bg-violet-500',
    glow: 'shadow-violet-500/10',
  },
  rose: {
    gradient: 'from-rose-500/20 to-pink-600/10',
    iconBg: 'bg-rose-500/15 text-rose-600',
    iconBorder: 'border-rose-500/25',
    trendUp: 'text-rose-600',
    accent: 'bg-rose-500',
    glow: 'shadow-rose-500/10',
  },
};

function AnimatedValue({ value, enabled }: { value: string | number; enabled: boolean }) {
  const [display, setDisplay] = useState(enabled ? '0' : String(value));
  const startedRef = useRef(false);
  const numericValue = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, '')) || 0 : value;

  useEffect(() => {
    if (!enabled || startedRef.current) {
      setDisplay(String(value));
      return;
    }
    startedRef.current = true;

    const isNum = typeof numericValue === 'number' && !isNaN(numericValue);
    if (!isNum) {
      setDisplay(String(value));
      return;
    }

    const prefix = typeof value === 'string' ? value.replace(/[0-9]/g, '').match(/^[^0-9]*/)?.[0] || '' : '';
    const target = numericValue as number;
    const duration = 800;
    const steps = 20;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setDisplay(`${prefix}${current.toLocaleString('es-CO')}`);
      if (step >= steps) {
        setDisplay(String(value));
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, enabled, numericValue]);

  return <>{display}</>;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  variant = 'emerald',
  animate = true,
}: StatCardProps) {
  const [mounted, setMounted] = useState(false);
  const styles = variantStyles[variant];

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5',
        styles.glow,
        mounted && animate ? 'animate-fade-in-up' : '',
      )}
      style={{ animationDelay: '0.1s' }}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', styles.gradient)} />
      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              <AnimatedValue value={value} enabled={mounted && animate} />
            </p>
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-medium',
                  trendUp ? styles.trendUp : 'text-destructive',
                )}
              >
                {trendUp ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {trend}
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-all duration-300',
            styles.iconBg,
            styles.iconBorder,
            'group-hover:scale-110 group-hover:shadow-sm',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div
        className={cn(
          'absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full',
          styles.accent,
        )}
      />
    </div>
  );
}
