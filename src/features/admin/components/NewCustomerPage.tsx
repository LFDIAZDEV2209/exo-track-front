'use client';

import { useState } from 'react';
import { Card, CardContent, CardTitle } from '@/shared/ui/card';
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
import { Loader2, CheckCircle2, Copy, Check, UserPlus, User, IdCard, Mail, Phone, Lock, Key } from 'lucide-react';

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
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });



  const copyToClipboard = async (text: string, field: 'document' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: 'Copiado',
        description: `${field === 'document' ? 'Cédula' : 'Contraseña'} copiada al portapapeles`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
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
    // Marcar que se creó un cliente para recargar datos en CustomersPage
    sessionStorage.setItem('customerCreated', 'true');
    router.push('/admin/customers');
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/20">
            <UserPlus className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Nuevo Cliente</h1>
            <p className="text-sm text-muted-foreground">Agrega un nuevo cliente al sistema</p>
          </div>
        </div>

        <Card className="overflow-hidden border-t-4 border-t-emerald-600">
          <div className="bg-emerald-600 px-6 py-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-white" />
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
                  disabled={isLoading}
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
                  <Lock className="h-4 w-4 text-emerald-500" /> Contraseña (Opcional)
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isLoading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20"
                />
                {errors.password && (
                  <p className="text-sm text-destructive font-medium">{errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground italic">
                  Si no se proporciona, se generará automáticamente con las dos primeras letras del nombre + cédula
                </p>
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <><UserPlus className="mr-2 h-4 w-4" /> Crear Cliente</>
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
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="font-bold">Cliente creado exitosamente</DialogTitle>
                <DialogDescription>Guarda estas credenciales para enviarlas al usuario.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold flex items-center gap-1.5"><IdCard className="h-4 w-4 text-emerald-500" /> Cédula</Label>
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
                >
                  {copiedField === 'document' ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-bold flex items-center gap-1.5"><Key className="h-4 w-4 text-amber-500" /> Contraseña</Label>
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
                >
                  {copiedField === 'password' ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleCloseModal} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
