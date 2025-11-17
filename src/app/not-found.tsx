import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">404 - Página no encontrada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            La página que estás buscando no existe o ha sido movida.
          </p>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/">Ir al inicio</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

