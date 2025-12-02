'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { FileText, Loader2, ArrowLeft, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import { userService, declarationService } from '@/services';
import { Badge } from '@/shared/ui/badge';
import { useRouter } from 'next/navigation';

interface CustomerDetailPageProps {
  customerId: string;
}

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [declarations, setDeclarations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientData, declarationsData] = await Promise.all([
          userService.findOne(customerId),
          declarationService.findAll(undefined, customerId),
        ]);

        setClient({
          ...clientData,
          totalDeclarations: declarationsData.length,
        });
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/customers')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Declaraciones de {client.fullName}
          </h1>
          <p className="text-muted-foreground">
            Administra las declaraciones de renta del cliente
          </p>
        </div>
        <Link href={`/admin/customers/${customerId}/declarations/new-declaration`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Declaración
          </Button>
        </Link>
      </div>

      {declarations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No hay declaraciones para este cliente
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {declarations.map((declaration) => (
            <Card key={declaration.id} className="relative">
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
                    {declaration.status === 'finalizada' ? 'Finalizada' : 'Borrador'}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2">Año {declaration.taxableYear}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  {formatDate(declaration.createdAt)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {declaration.description || 'Sin descripción'}
                </p>
                <Link href={`/admin/customers/${customerId}/declarations/${declaration.id}`}>
                  <Button variant="outline" className="w-full">
                    Ver Detalle
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
