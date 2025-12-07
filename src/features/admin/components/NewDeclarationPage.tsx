'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { declarationSchema, type DeclarationFormData } from '@/lib/validations';
import { declarationService, userService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { DeclarationStatus } from '@/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import { FileUpload } from '@/shared/layout/file-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

interface NewDeclarationPageProps {
  customerId: string;
}

export function NewDeclarationPage({ customerId }: NewDeclarationPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [existingYears, setExistingYears] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientData, taxableYears] = await Promise.all([
          userService.findOne(customerId),
          declarationService.getTaxableYearsByUser(customerId),
        ]);
        setClient(clientData);
        setExistingYears(taxableYears);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    fetchData();
  }, [customerId]);

  const {
    control,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm<DeclarationFormData>({
    // @ts-ignore
    resolver: zodResolver(declarationSchema),
  });

  const selectedYear = watch('taxableYear');

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i).filter(
    (year) => !existingYears.includes(year)
  );

  const onSubmit = async (data: DeclarationFormData) => {
    try {
      setIsLoading(true);
      await declarationService.create({
        userId: customerId,
        taxableYear: data.taxableYear,
        status: DeclarationStatus.PENDING,
        description: data.description || '',
      });

      toast({
        title: 'Declaración creada',
        description: 'La declaración ha sido creada exitosamente',
      });

      router.push(`/admin/customers/${customerId}`);
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

  const onCreateEmpty = async () => {
    const formValues = getValues();
    if (!formValues?.taxableYear) {
      toast({
        title: 'Año requerido',
        description: 'Por favor selecciona un año para la declaración',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await declarationService.create({
        userId: customerId,
        taxableYear: formValues.taxableYear,
        status: DeclarationStatus.PENDING,
        description: '',
      });

      toast({
        title: 'Declaración creada',
        description: 'La declaración vacía ha sido creada exitosamente. Puedes agregar los datos manualmente.',
      });

      router.push(`/admin/customers/${customerId}`);
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Nueva Declaración</h1>
          <p className="text-muted-foreground">
            Crea una declaración de renta para {client?.fullName || 'el cliente'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Declaración</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Selecciona el año y elige crear con archivo exógeno o crear una declaración vacía
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="taxableYear">Año de la Declaración</Label>
              <Controller
                name="taxableYear"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="taxableYear" className="w-full">
                      <SelectValue placeholder="Selecciona un año" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.taxableYear && (
                <p className="text-sm text-destructive">{errors.taxableYear.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Los años con declaraciones existentes no se mostrarán
              </p>
            </div>

            <div className="space-y-2">
              <Label>Archivo del Exógeno DIAN (Opcional)</Label>
              <FileUpload
                onFileSelect={setSelectedFile}
                accept=".xlsx,.xls"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Puedes crear la declaración sin archivo y agregar los datos manualmente después
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isLoading || !selectedYear || !selectedFile}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Procesar y Crear'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCreateEmpty}
                disabled={isLoading || !selectedYear || !!selectedFile}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Declaración Vacía'
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
