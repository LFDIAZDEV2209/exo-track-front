'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, AlertCircle, CheckCircle2, FileText as FileTextIcon, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { StatCard } from '@/shared/layout/stat-card';
import { Badge } from '@/shared/ui/badge';
import { userService, declarationService } from '@/services';
import { useAuthStore } from '@/stores/auth-store';
import { formatRelativeDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { DeclarationStatus } from '@/types';

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
        
        // Usar endpoints dedicados para estadísticas
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
          clientsThisMonth: 0, // No disponible en el endpoint actual
          completionRate: declarationsStats.completionRate,
          averagePerClient: usersStats.averageDeclarationsPerUser,
          activeClients: usersStats.totalActiveUsers,
        });

        // Mapear la actividad reciente al formato esperado
        const mappedActivity = recentActivityData.map((item) => ({
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userName = user?.fullName?.split(' ')[0] || 'Usuario';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="animate-in fade-in slide-in-from-top-4 duration-300">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {userName}</h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de tu actividad reciente
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: '100ms' }}>
          <StatCard
            title="Total Clientes"
            value={stats.totalClients}
            icon={Users}
            trend={stats.clientsThisMonth > 0 ? `+${stats.clientsThisMonth} este mes` : undefined}
            trendColor="green"
            colorClass="bg-blue-500"
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: '200ms' }}>
          <StatCard
            title="Declaraciones Pendientes"
            value={stats.pendingDeclarations}
            icon={AlertCircle}
            colorClass="bg-orange-500"
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: '300ms' }}>
          <StatCard
            title="Finalizadas Este Mes"
            value={stats.completedThisMonth}
            icon={CheckCircle2}
            trend={stats.completedThisMonth > 0 ? '+12%' : undefined}
            trendColor="green"
            colorClass="bg-green-500"
          />
        </div>
      </div>

      <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Últimas declaraciones trabajadas en el sistema
          </p>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay actividad reciente
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((declaration, index) => (
                <div 
                  key={declaration.id} 
                  className="flex items-center gap-4 py-2 transition-colors duration-150 hover:bg-accent/50 rounded-lg px-2 animate-in fade-in slide-in-from-left-4"
                  style={{ animationDelay: `${(index * 50) + 500}ms` }}
                >
                  <FileTextIcon className="h-5 w-5 text-muted-foreground transition-transform duration-200 hover:scale-110" />
                  <div className="flex-1">
                    <p className="font-medium">{declaration.userFullName}</p>
                    <p className="text-sm text-muted-foreground">
                      Declaración {declaration.taxableYear}
                    </p>
                  </div>
                  <Badge
                    variant={declaration.status === DeclarationStatus.COMPLETED ? 'default' : 'secondary'}
                    className={declaration.status === DeclarationStatus.PENDING ? 'bg-orange-100 text-orange-800' : ''}
                  >
                    {declaration.status === DeclarationStatus.COMPLETED ? 'Finalizada' : 'Pendiente'}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {formatRelativeDate(declaration.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: '500ms' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Estadísticas Rápidas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground transition-transform duration-200 hover:scale-110" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Promedio por cliente', value: `${stats.averagePerClient.toFixed(1)} declaraciones` },
              { label: 'Tasa de finalización', value: `${stats.completionRate}%` },
              { label: 'Total declaraciones', value: stats.totalDeclarations },
              { label: 'Clientes activos', value: stats.activeClients },
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${(index * 100) + 600}ms` }}
              >
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
