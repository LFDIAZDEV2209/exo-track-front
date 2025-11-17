'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { FileText, Loader2 } from 'lucide-react';
import { declarationService } from '@/services';
import { useAuthStore } from '@/stores/auth-store';
import { Badge } from '@/shared/ui/badge';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export function UserDeclarationsPage() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [declarations, setDeclarations] = useState<any[]>([]);

  useEffect(() => {
    const fetchDeclarations = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const data = await declarationService.getByUserId(user.id);
        setDeclarations(data);
      } catch (error) {
        console.error('Error loading declarations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeclarations();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Declaraciones</h1>
        <p className="text-muted-foreground">
          Lista de todas tus declaraciones de renta
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Declaraciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : declarations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No tienes declaraciones registradas
            </p>
          ) : (
            <div className="space-y-4">
              {declarations.map((declaration) => (
                <Link
                  key={declaration.id}
                  href={`/user/declarations/${declaration.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        Declaración {declaration.taxableYear}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {declaration.description || 'Sin descripción'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Creada: {new Date(declaration.createdAt).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <Badge
                      variant={declaration.status === 'finalizada' ? 'default' : 'secondary'}
                    >
                      {declaration.status === 'finalizada' ? 'Finalizada' : 'Borrador'}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
