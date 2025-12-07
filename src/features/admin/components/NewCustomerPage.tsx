'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, type ClientFormData } from '@/lib/validations';
import { authService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Copy, Check } from 'lucide-react';

/**
 * Genera una contraseña automática basada en las dos primeras letras del nombre y la cédula
 */
function generatePassword(fullName: string, documentNumber: string): string {
  // Obtener las dos primeras letras del nombre (sin espacios, en minúsculas)
  const nameLetters = fullName
    .trim()
    .replace(/\s+/g, '')
    .substring(0, 2)
    .toLowerCase();
  
  // Combinar: 2 letras + cédula
  return `${nameLetters}${documentNumber}`;
}

export function NewCustomerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    documentNumber: string;
    password: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<'document' | 'password' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ClientFormData>({
    // @ts-ignore
    resolver: zodResolver(clientSchema),
  });

  const fullName = watch('fullName');
  const documentNumber = watch('documentNumber');

  const copyToClipboard = async (text: string, field: 'document' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: 'Copiado',
        description: `${field === 'document' ? 'Cédula' : 'Contraseña'} copiada al portapapeles`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar al portapapeles',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsLoading(true);
      
      // Generar contraseña automáticamente si no se proporciona
      const password = data.password || generatePassword(data.fullName, data.documentNumber);
      
      // Usar authService.register para crear el cliente
      // El backend asigna automáticamente role: "user" para los clientes
      await authService.register({
        fullName: data.fullName,
        documentNumber: data.documentNumber,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: password,
      });

      // Guardar las credenciales para mostrar en el modal
      setCreatedCredentials({
        documentNumber: data.documentNumber,
        password: password,
      });
      
      // Mostrar modal de éxito
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: 'Error',
        description: error?.message || error?.errors?.message?.[0] || 'Error al crear el cliente',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.push('/admin/customers');
  };

  return (
    <>
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
                <Label htmlFor="password">Contraseña (Opcional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Si no se proporciona, se generará automáticamente con las dos primeras letras del nombre + cédula
                </p>
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Cliente'
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

      {/* Modal de éxito */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <DialogTitle>Cliente creado exitosamente</DialogTitle>
            </div>
            <DialogDescription>
              El cliente ha sido creado. Guarda estas credenciales para enviarlas al usuario.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cédula</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={createdCredentials?.documentNumber || ''}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(createdCredentials?.documentNumber || '', 'document')}
                  title="Copiar cédula"
                >
                  {copiedField === 'document' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Contraseña</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={createdCredentials?.password || ''}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(createdCredentials?.password || '', 'password')}
                  title="Copiar contraseña"
                >
                  {copiedField === 'password' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleCloseModal} className="w-full">
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
