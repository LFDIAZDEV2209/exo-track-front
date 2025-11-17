'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { FileText } from 'lucide-react';

export function UserDeclarationsPage() {
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
          <p className="text-sm text-muted-foreground">
            Aquí se mostrarán tus declaraciones
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

