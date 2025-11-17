'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { FileText, Calendar, Download } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface DeclarationDetailPageProps {
  declarationId: string;
}

export function DeclarationDetailPage({ declarationId }: DeclarationDetailPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Detalle de Declaración</h1>
        <p className="text-muted-foreground">
          Información completa de la declaración
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información de la Declaración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">ID de Declaración</p>
            <p className="text-sm text-muted-foreground">{declarationId}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Estado</p>
            <p className="text-sm text-muted-foreground">En proceso</p>
          </div>
          <div className="flex gap-4 pt-4">
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

