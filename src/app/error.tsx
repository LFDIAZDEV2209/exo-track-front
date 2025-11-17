'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Algo salió mal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              Intentar de nuevo
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="flex-1">
              Ir al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

