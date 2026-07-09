'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
  FileText as FileTextIcon,
  TrendingUp,
  UserPlus,
  BarChart3,
  Hand,
  Sparkles,
  Activity,
} from 'lucide-react';
import { StatCard } from '@/shared/layout/stat-card';
import { Badge } from '@/shared/ui/badge';
import { userService, declarationService } from '@/services';
import { useAuthStore } from '@/stores/auth-store';
import { formatRelativeDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { DeclarationStatus } from '@/types';

function SectionHeader({ title, description, icon: Icon }: { title: string; description?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-600 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
        {Icon && <Icon className="h-4 w-4 text-white" />}
      </div>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
        {description && (
          <p className="text-sm text-emerald-100">{description}</p>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalDeclarations: 0,
    pendingDeclarations: 0,
    completedThisMonth: 0,
    clientsThisMonth: 0,
    completionRate: 0,
    averagePerClient: 0,
    activeClients: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [usersStats, declarationsStats, recentActivityData] = await Promise.all([
          userService.getStats(),
          declarationService.getStats(),
          declarationService.getRecentActivity(),
        ]);

        setStats({
          totalClients: usersStats.totalUsers,
          totalDeclarations: declarationsStats.totalDeclarations,
          pendingDeclarations: declarationsStats.totalPending,
          completedThisMonth: declarationsStats.completedThisMonth,
          clientsThisMonth: 0,
          completionRate: declarationsStats.completionRate,
          averagePerClient: usersStats.averageDeclarationsPerUser,
          activeClients: usersStats.totalActiveUsers,
        });

        interface ActivityItem { id: string; taxableYear: number; status: string; description: string; updatedAt: string; user: { fullName: string } }
        const mappedActivity = recentActivityData.map((item: ActivityItem) => ({
          id: item.id,
          taxableYear: item.taxableYear,
          status: item.status,
          description: item.description,
          updatedAt: item.updatedAt,
          userFullName: item.user.fullName,
        }));

        setRecentActivity(mappedActivity);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <div className="absolute inset-0 h-8 w-8 animate-pulse rounded-full bg-emerald-500/5" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const userName = user?.fullName?.split(' ')[0] || 'Usuario';

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-down">
        <div className="flex items-center gap-4 mb-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/20">
            <Hand className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">¡Bienvenido, {userName}!</h1>
            <p className="text-muted-foreground text-sm">Resumen general del sistema de declaraciones</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Panel de control</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="animate-fade-in-up stagger-1">
          <StatCard
            title="Total Clientes"
            value={stats.totalClients}
            icon={Users}
            variant="emerald"
            trend={stats.activeClients > 0 ? `${stats.activeClients} activos` : undefined}
            trendUp
          />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <StatCard
            title="Declaraciones Pendientes"
            value={stats.pendingDeclarations}
            icon={AlertCircle}
            variant="amber"
            trend={stats.pendingDeclarations > 0 ? 'Requieren atención' : undefined}
            trendUp={false}
          />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <StatCard
            title="Finalizadas Este Mes"
            value={stats.completedThisMonth}
            icon={CheckCircle2}
            variant="emerald"
            trend={stats.completionRate > 0 ? `${stats.completionRate}% tasa` : undefined}
            trendUp
          />
        </div>
      </div>

      <div className="animate-fade-in-up stagger-4">
        <SectionHeader
          title="Actividad Reciente"
          description="Últimas declaraciones trabajadas en el sistema"
          icon={Activity}
        />
      </div>

      <div className="animate-fade-in-up stagger-5">
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileTextIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentActivity.map((declaration) => (
                <div
                  key={declaration.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <FileTextIcon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{declaration.userFullName}</p>
                    <p className="text-xs text-muted-foreground">
                      Declaración año {declaration.taxableYear}
                    </p>
                  </div>
                  <Badge
                    variant={declaration.status === DeclarationStatus.COMPLETED ? 'default' : 'secondary'}
                    className={
                      declaration.status === DeclarationStatus.PENDING
                        ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                    }
                  >
                    {declaration.status === DeclarationStatus.COMPLETED ? 'Finalizada' : 'Pendiente'}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                    {formatRelativeDate(declaration.updatedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="animate-fade-in-up stagger-6">
        <SectionHeader
          title="Estadísticas del Sistema"
          description="Métricas generales de la plataforma"
          icon={BarChart3}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-7">
        {[
          {
            label: 'Promedio por cliente',
            value: `${stats.averagePerClient.toFixed(1)}`,
            suffix: 'decl.',
            icon: BarChart3,
            variant: 'navy' as const,
          },
          {
            label: 'Tasa de finalización',
            value: `${stats.completionRate}`,
            suffix: '%',
            icon: TrendingUp,
            variant: 'emerald' as const,
          },
          {
            label: 'Total declaraciones',
            value: stats.totalDeclarations,
            suffix: '',
            icon: FileText,
            variant: 'violet' as const,
          },
          {
            label: 'Clientes activos',
            value: stats.activeClients,
            suffix: '',
            icon: UserPlus,
            variant: 'amber' as const,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group relative rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">
                {stat.label}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/50 text-muted-foreground/60">
                <stat.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {stat.value}
              {stat.suffix && (
                <span className="text-sm font-normal text-muted-foreground ml-1">{stat.suffix}</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
