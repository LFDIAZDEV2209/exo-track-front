'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

interface DeclarationsPageProps {
  customerId: string;
}

export function DeclarationsPage({ customerId }: DeclarationsPageProps) {
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
          <p className="text-sm text-muted-foreground">
            Cliente ID: {customerId}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

