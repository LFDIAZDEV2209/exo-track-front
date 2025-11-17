'use client';

import { use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import Link from 'next/link';
import { FileText } from 'lucide-react';

interface CustomerDetailPageProps {
  customerId: string;
}

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
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
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ID del cliente: {customerId}
          </p>
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
          <p className="text-sm text-muted-foreground">
            Aquí se mostrarán las declaraciones del cliente
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

