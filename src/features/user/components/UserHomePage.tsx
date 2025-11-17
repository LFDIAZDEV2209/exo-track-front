'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { FileText, Calendar } from 'lucide-react';

export function UserHomePage() {
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
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Consulta el estado de tus declaraciones de renta
            </p>
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

