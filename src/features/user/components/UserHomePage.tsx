'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { FileText, Calendar } from 'lucide-react';
import { declarationService } from '@/services';
import { useAuthStore } from '@/stores/auth-store';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';

export function UserHomePage() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [declarations, setDeclarations] = useState<any[]>([]);

  useEffect(() => {
    const fetchDeclarations = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const data = await declarationService.getByUserId(user.id);
        setDeclarations(data.slice(0, 3)); // Mostrar solo las 3 más recientes
      } catch (error) {
        console.error('Error loading declarations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeclarations();
  }, [user?.id]);

  const pendingCount = declarations.filter((d) => d.status === 'borrador').length;
  const completedCount = declarations.filter((d) => d.status === 'finalizada').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido</h1>
        <p className="text-muted-foreground">
          Gestiona tus declaraciones de renta
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Mis Declaraciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Total: {declarations.length} declaraciones
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pendientes: {pendingCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completadas: {completedCount}
                  </p>
                </div>
                <Link href="/user/declarations">
                  <Button variant="outline" className="w-full">
                    Ver todas las declaraciones
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Fechas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fechas importantes para tus declaraciones
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
