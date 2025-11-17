'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { clientService, declarationService } from '@/services';
import { Badge } from '@/shared/ui/badge';

interface CustomerDetailPageProps {
  customerId: string;
}

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [declarations, setDeclarations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientData, declarationsData] = await Promise.all([
          clientService.getById(customerId),
          declarationService.getByUserId(customerId),
        ]);

        setClient(clientData);
        setDeclarations(declarationsData);
      } catch (error) {
        console.error('Error loading customer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Cliente no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Detalle del Cliente</h1>
        <p className="text-muted-foreground">
          Información y declaraciones del cliente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Nombre Completo</p>
            <p className="text-sm text-muted-foreground">{client.fullName}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Cédula</p>
            <p className="text-sm text-muted-foreground">{client.documentNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{client.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Teléfono</p>
            <p className="text-sm text-muted-foreground">{client.phoneNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Declaraciones</p>
            <p className="text-sm text-muted-foreground">{client.totalDeclarations}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Declaraciones</h2>
        <Link href={`/admin/customers/${customerId}/declarations/new-declaration`}>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Nueva Declaración
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Declaraciones</CardTitle>
        </CardHeader>
        <CardContent>
          {declarations.length === 0 ? (
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
