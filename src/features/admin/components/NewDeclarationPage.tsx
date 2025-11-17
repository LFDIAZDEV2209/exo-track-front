'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { useRouter } from 'next/navigation';

interface NewDeclarationPageProps {
  customerId: string;
}

export function NewDeclarationPage({ customerId }: NewDeclarationPageProps) {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para crear declaración
    router.push(`/admin/customers/${customerId}/declarations`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Declaración</h1>
        <p className="text-muted-foreground">
          Crea una nueva declaración de renta
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Declaración</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Input id="year" type="number" placeholder="2024" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" placeholder="Descripción de la declaración" />
            </div>
            <div className="flex gap-4">
              <Button type="submit">Crear Declaración</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

