'use client';

import { useEffect, useState } from 'react';
import { FileText, Calendar, Eye, Loader2, Hand, Sparkles, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { declarationService } from '@/services';
import { useAuthStore } from '@/stores/auth-store';
import { StatCard } from '@/shared/layout/stat-card';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { DeclarationStatus } from '@/types';
import { EmptyState } from '@/shared/layout/empty-state';

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

const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota',
  });
};

export function UserHomePage() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [declarations, setDeclarations] = useState<any[]>([]);

  useEffect(() => {
    const fetchDeclarations = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const response = await declarationService.findAllWithPagination(
          { limit: 3, offset: 0 },
          user.id,
        );
        setDeclarations(response.declarations);
      } catch (error) {
        console.error('Error loading declarations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeclarations();
  }, [user?.id]);

  const completedCount = declarations.filter(
    (d) => d.status === DeclarationStatus.COMPLETED,
  ).length;
  const pendingCount = declarations.filter(
    (d) => d.status === DeclarationStatus.PENDING,
  ).length;

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
            <p className="text-muted-foreground text-sm">Consulta el estado de tus declaraciones de renta</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mi portal</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="animate-fade-in-up stagger-1">
          <StatCard
            title="Total Declaraciones"
            value={declarations.length}
            icon={FileText}
            variant="navy"
          />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <StatCard
            title="Finalizadas"
            value={completedCount}
            icon={CheckCircle2}
            variant="emerald"
          />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <StatCard
            title="En Proceso"
            value={pendingCount}
            icon={AlertCircle}
            variant="amber"
          />
        </div>
      </div>

      <div className="animate-fade-in-up stagger-4">
        <SectionHeader
          title="Mis Declaraciones Recientes"
          description="Tus últimas declaraciones registradas"
          icon={Clock}
        />
      </div>

      <div className="animate-fade-in-up stagger-5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : declarations.length === 0 ? (
          <div className="rounded-xl border bg-card shadow-sm">
            <EmptyState
              title="Sin declaraciones"
              description="Aún no tienes declaraciones registradas. Contacta a tu contador."
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {declarations.map((declaration) => (
              <div
                key={declaration.id}
                className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-emerald-500/5 to-transparent" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <FileText className="h-5 w-5" />
                    </div>
                    <Badge
                      variant={
                        declaration.status === DeclarationStatus.COMPLETED
                          ? 'default'
                          : 'secondary'
                      }
                      className={
                        declaration.status === DeclarationStatus.PENDING
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                      }
                    >
                      {declaration.status === DeclarationStatus.COMPLETED
                        ? 'Finalizada'
                        : 'En Proceso'}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">Año {declaration.taxableYear}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(declaration.createdAt)}
                  </div>
                  <Link href={`/user/declarations/${declaration.id}`}>
                    <Button
                      variant="outline"
                      className="w-full transition-all duration-200 group-hover:border-emerald-500/30 group-hover:text-emerald-600"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalle
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
