'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Loader2 } from 'lucide-react';
import { declarationService } from '@/services';
import { Badge } from '@/shared/ui/badge';
import Link from 'next/link';

interface DeclarationsPageProps {
  customerId: string;
}

export function DeclarationsPage({ customerId }: DeclarationsPageProps) {
  const [loading, setLoading] = useState(true);
  const [declarations, setDeclarations] = useState<any[]>([]);

  useEffect(() => {
    const fetchDeclarations = async () => {
      try {
        setLoading(true);
        const data = await declarationService.findAll(undefined, customerId);
        setDeclarations(data);
      } catch (error) {
        console.error('Error loading declarations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeclarations();
  }, [customerId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Declaraciones</h1>
        <p className="text-muted-foreground">
          Declaraciones del cliente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Declaraciones</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : declarations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay declaraciones para este cliente
            </p>
          ) : (
            <div className="space-y-4">
              {declarations.map((declaration) => (
                <Link
                  key={declaration.id}
                  href={`/admin/customers/${customerId}/declarations/${declaration.id}`}
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
