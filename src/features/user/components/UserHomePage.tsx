'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { FileText, Calendar, Eye } from 'lucide-react';
import { declarationService } from '@/services';
import { useAuthStore } from '@/stores/auth-store';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

export function UserHomePage() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [allDeclarations, setAllDeclarations] = useState<any[]>([]);
  const [recentDeclarations, setRecentDeclarations] = useState<any[]>([]);

  useEffect(() => {
    const fetchDeclarations = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const data = await declarationService.getByUserId(user.id);
        setAllDeclarations(data);
        setRecentDeclarations(data.slice(0, 3)); // Mostrar solo las 3 más recientes
      } catch (error) {
        console.error('Error loading declarations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeclarations();
  }, [user?.id]);

  const totalCount = allDeclarations.length;
  const completedCount = allDeclarations.filter((d) => d.status === 'finalizada').length;
  const inProcessCount = allDeclarations.filter((d) => d.status === 'borrador').length;

  const userName = user?.fullName?.split(' ')[0] || 'Usuario';

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {userName}</h1>
        <p className="text-muted-foreground">
          Consulta el estado de tus declaraciones de renta
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Declaraciones</p>
            <p className="text-3xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Finalizadas</p>
            <p className="text-3xl font-bold">{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">En Proceso</p>
            <p className="text-3xl font-bold">{inProcessCount}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Mis Declaraciones</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : recentDeclarations.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No tienes declaraciones registradas
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {recentDeclarations.map((declaration) => (
              <Card key={declaration.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <Badge
                      variant={declaration.status === 'finalizada' ? 'default' : 'secondary'}
                      className={
                        declaration.status === 'borrador'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {declaration.status === 'finalizada' ? 'Finalizada' : 'En Proceso'}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Año {declaration.taxableYear}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    {formatDate(declaration.createdAt)}
                  </div>
                  <Link href={`/user/declarations/${declaration.id}`}>
                    <Button variant="outline" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalle
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
