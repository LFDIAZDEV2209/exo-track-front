'use client';

import { LayoutDashboard, Users, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { StatCard } from '@/shared/layout/stat-card';

export function DashboardPage() {
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
          value="24"
          icon={Users}
          trend="+12%"
          colorClass="bg-blue-500"
        />
        <StatCard
          title="Declaraciones"
          value="156"
          icon={FileText}
          trend="+8%"
          colorClass="bg-green-500"
        />
        <StatCard
          title="Pendientes"
          value="12"
          icon={TrendingUp}
          trend="-3%"
          colorClass="bg-yellow-500"
        />
        <StatCard
          title="Completadas"
          value="144"
          icon={LayoutDashboard}
          trend="+15%"
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

