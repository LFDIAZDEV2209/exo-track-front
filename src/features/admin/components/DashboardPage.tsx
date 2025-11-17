'use client';

import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { StatCard } from '@/shared/layout/stat-card';
import { clientService, declarationService } from '@/services';
import { Loader2 } from 'lucide-react';

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalDeclarations: 0,
    pendingDeclarations: 0,
    completedDeclarations: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [clients, declarations] = await Promise.all([
          clientService.getAll(),
          declarationService.getAll(),
        ]);

        const pending = declarations.filter((d) => d.status === 'borrador').length;
        const completed = declarations.filter((d) => d.status === 'finalizada').length;

        setStats({
          totalClients: clients.length,
          totalDeclarations: declarations.length,
          pendingDeclarations: pending,
          completedDeclarations: completed,
        });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clientes"
          value={stats.totalClients}
          icon={Users}
          trend=""
          colorClass="bg-blue-500"
        />
        <StatCard
          title="Declaraciones"
          value={stats.totalDeclarations}
          icon={FileText}
          trend=""
          colorClass="bg-green-500"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendingDeclarations}
          icon={TrendingUp}
          trend=""
          colorClass="bg-yellow-500"
        />
        <StatCard
          title="Completadas"
          value={stats.completedDeclarations}
          icon={LayoutDashboard}
          trend=""
          colorClass="bg-purple-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No hay actividad reciente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Estadísticas del mes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
