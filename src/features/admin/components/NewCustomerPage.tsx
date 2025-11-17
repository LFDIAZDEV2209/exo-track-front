'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useRouter } from 'next/navigation';

export function NewCustomerPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para crear cliente
    router.push('/admin/customers');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h1>
        <p className="text-muted-foreground">
          Agrega un nuevo cliente al sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input id="nombre" placeholder="Nombre completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula</Label>
              <Input id="cedula" placeholder="Número de cédula" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@ejemplo.com" />
            </div>
            <div className="flex gap-4">
              <Button type="submit">Crear Cliente</Button>
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

