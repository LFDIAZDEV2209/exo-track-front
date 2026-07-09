'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, type ClientFormData } from '@/lib/validations';
import { userService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, UserCog, Save, XCircle, User, IdCard, Mail, Phone, Lock } from 'lucide-react';

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/20">
          <UserCog className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Editar Cliente</h1>
          <p className="text-sm text-muted-foreground">Modifica la información del cliente</p>
        </div>
      </div>

      <Card className="overflow-hidden border-t-4 border-t-emerald-600">
        <div className="bg-emerald-600 px-6 py-4">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-white" />
            <CardTitle className="font-bold text-white">Información del Cliente</CardTitle>
          </div>
        </div>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-bold flex items-center gap-1.5">
                <User className="h-4 w-4 text-emerald-500" /> Nombre Completo
              </Label>
              <Input
                id="fullName"
                placeholder="Nombre completo"
                {...register('fullName')}
                disabled={isLoading}
                className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive font-medium">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentNumber" className="font-bold flex items-center gap-1.5">
                <IdCard className="h-4 w-4 text-emerald-500" /> Cédula
              </Label>
              <Input
                id="documentNumber"
                placeholder="Número de cédula"
                {...register('documentNumber')}
                disabled
                className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20"
              />
              {errors.documentNumber && (
                <p className="text-sm text-destructive font-medium">{errors.documentNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-emerald-500" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@ejemplo.com"
                {...register('email')}
                disabled={isLoading}
                className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20"
              />
              {errors.email && (
                <p className="text-sm text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="font-bold flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-emerald-500" /> Teléfono
              </Label>
              <Input
                id="phoneNumber"
                placeholder="Número de teléfono"
                {...register('phoneNumber')}
                disabled={isLoading}
                className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-destructive font-medium">{errors.phoneNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-emerald-500" /> Nueva Contraseña (Opcional)
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Dejar vacío para mantener la actual"
                {...register('password')}
                disabled={isLoading}
                className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20"
              />
              {errors.password && (
                <p className="text-sm text-destructive font-medium">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Solo completa este campo si deseas cambiar la contraseña del cliente
              </p>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
              >
                <XCircle className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
