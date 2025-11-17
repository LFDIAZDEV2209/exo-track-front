'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { declarationSchema, type DeclarationFormData } from '@/lib/validations';
import { declarationService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface NewDeclarationPageProps {
  customerId: string;
}

export function NewDeclarationPage({ customerId }: NewDeclarationPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeclarationFormData>({
    // @ts-ignore
    resolver: zodResolver(declarationSchema),
  });

  const onSubmit = async (data: DeclarationFormData) => {
    try {
      setIsLoading(true);
      await declarationService.create({
        userId: customerId,
        taxableYear: data.taxableYear,
        description: data.description || '',
      });

      toast({
        title: 'Declaración creada',
        description: 'La declaración ha sido creada exitosamente',
      });

      router.push(`/admin/customers/${customerId}/declarations`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear la declaración',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taxableYear">Año</Label>
              <Input
                id="taxableYear"
                type="number"
                placeholder="2024"
                {...register('taxableYear', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.taxableYear && (
                <p className="text-sm text-destructive">{errors.taxableYear.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción de la declaración"
                {...register('description')}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Declaración'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
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
