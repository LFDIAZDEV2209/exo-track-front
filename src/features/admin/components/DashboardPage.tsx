'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, AlertCircle, CheckCircle2, FileText as FileTextIcon, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { StatCard } from '@/shared/layout/stat-card';
import { Badge } from '@/shared/ui/badge';
import { clientService, declarationService } from '@/services';
import { useAuthStore } from '@/stores/auth-store';
import { formatRelativeDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

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
        const [clients, declarations] = await Promise.all([
          clientService.getAll(),
          declarationService.getAll(),
        ]);

        const pending = declarations.filter((d) => d.status === 'borrador').length;
        const now = new Date();
        const thisMonth = declarations.filter((d) => {
          const date = new Date(d.createdAt);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
        const completedThisMonth = thisMonth.filter((d) => d.status === 'finalizada').length;
        const clientsThisMonth = clients.filter((c) => {
          const date = new Date(c.createdAt);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;

        const completed = declarations.filter((d) => d.status === 'finalizada').length;
        const completionRate = declarations.length > 0 
          ? Math.round((completed / declarations.length) * 100) 
          : 0;
        const averagePerClient = clients.length > 0 
          ? (declarations.length / clients.length).toFixed(1)
          : '0.0';
        const activeClients = clients.length;

        // Ordenar declaraciones por fecha más reciente y tomar las 5 primeras
        const sortedDeclarations = [...declarations]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);

        setStats({
          totalClients: clients.length,
          totalDeclarations: declarations.length,
          pendingDeclarations: pending,
          completedThisMonth,
          clientsThisMonth,
          completionRate,
          averagePerClient: parseFloat(averagePerClient),
          activeClients,
        });
        setRecentActivity(sortedDeclarations);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {userName}</h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de tu actividad reciente
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Clientes"
          value={stats.totalClients}
          icon={Users}
          trend={stats.clientsThisMonth > 0 ? `+${stats.clientsThisMonth} este mes` : undefined}
          trendColor="green"
          colorClass="bg-blue-500"
        />
        <StatCard
          title="Declaraciones Pendientes"
          value={stats.pendingDeclarations}
          icon={AlertCircle}
          colorClass="bg-orange-500"
        />
        <StatCard
          title="Finalizadas Este Mes"
          value={stats.completedThisMonth}
          icon={CheckCircle2}
          trend={stats.completedThisMonth > 0 ? '+12%' : undefined}
          trendColor="green"
          colorClass="bg-green-500"
        />
      </div>

      <Card>
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
              {recentActivity.map((declaration) => (
                <div key={declaration.id} className="flex items-center gap-4 py-2">
                  <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{declaration.userFullName}</p>
                    <p className="text-sm text-muted-foreground">
                      Declaración {declaration.taxableYear}
                    </p>
                  </div>
                  <Badge
                    variant={declaration.status === 'finalizada' ? 'default' : 'secondary'}
                    className={declaration.status === 'borrador' ? 'bg-orange-100 text-orange-800' : ''}
                  >
                    {declaration.status === 'finalizada' ? 'Finalizada' : 'Borrador'}
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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Estadísticas Rápidas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Promedio por cliente</p>
              <p className="text-2xl font-bold">{stats.averagePerClient} declaraciones</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasa de finalización</p>
              <p className="text-2xl font-bold">{stats.completionRate}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total declaraciones</p>
              <p className="text-2xl font-bold">{stats.totalDeclarations}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes activos</p>
              <p className="text-2xl font-bold">{stats.activeClients}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
