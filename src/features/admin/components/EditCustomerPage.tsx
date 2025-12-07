'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, type ClientFormData } from '@/lib/validations';
import { userService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

interface EditCustomerPageProps {
  customerId: string;
}

export function EditCustomerPage({ customerId }: EditCustomerPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    // @ts-ignore
    resolver: zodResolver(clientSchema),
  });

  // Cargar datos del cliente
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setIsLoadingData(true);
        const customer = await userService.findOne(customerId);
        
        // Prellenar el formulario con los datos del cliente
        reset({
          fullName: customer.fullName,
          documentNumber: customer.documentNumber,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          password: '', // No prellenar la contraseña por seguridad
        });
      } catch (error: any) {
        console.error('Error loading customer:', error);
        toast({
          title: 'Error',
          description: error?.message || 'Error al cargar los datos del cliente',
          variant: 'destructive',
        });
        router.push('/admin/customers');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId, reset, router, toast]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsLoading(true);
      
      // Preparar los datos para actualizar (solo los campos que el backend acepta)
      const updateData: {
        fullName: string;
        documentNumber: string;
        email: string;
        phoneNumber: string;
        password?: string;
      } = {
        fullName: data.fullName,
        documentNumber: data.documentNumber,
        email: data.email,
        phoneNumber: data.phoneNumber,
      };

      // Solo incluir password si se proporcionó uno nuevo
      if (data.password && data.password.trim() !== '') {
        updateData.password = data.password;
      }

      // Actualizar el cliente
      await userService.update(customerId, updateData);

      toast({
        title: 'Cliente actualizado',
        description: 'Los datos del cliente han sido actualizados exitosamente',
      });

      router.push('/admin/customers');
    } catch (error: any) {
      console.error('Error updating client:', error);
      
      // Manejar el caso donde el mensaje es un array
      const errorMessage = Array.isArray(error?.message) 
        ? error.message[0] 
        : error?.message || error?.errors?.message?.[0] || 'Error al actualizar el cliente';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
          <p className="text-muted-foreground">
            Modifica la información del cliente
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                placeholder="Nombre completo"
                {...register('fullName')}
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentNumber">Cédula</Label>
              <Input
                id="documentNumber"
                placeholder="Número de cédula"
                {...register('documentNumber')}
                disabled={isLoading}
              />
              {errors.documentNumber && (
                <p className="text-sm text-destructive">{errors.documentNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@ejemplo.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Teléfono</Label>
              <Input
                id="phoneNumber"
                placeholder="Número de teléfono"
                {...register('phoneNumber')}
                disabled={isLoading}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña (Opcional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Dejar vacío para mantener la actual"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Solo completa este campo si deseas cambiar la contraseña del cliente
              </p>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
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
