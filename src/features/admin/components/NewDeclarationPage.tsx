'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { declarationSchema, type DeclarationFormData } from '@/lib/validations';
import { declarationService, userService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { DeclarationStatus } from '@/types';
import { Loader2, ArrowLeft, FilePlus, Info, Calendar, Upload, FileUp, XCircle } from 'lucide-react';
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
    resolver: zodResolver(declarationSchema),
  });

  const selectedYear = watch('taxableYear');

  const currentYear = new Date().getFullYear();
  const existingYearsSet = useMemo(() => new Set(existingYears), [existingYears]);
  const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i).filter(
    (year) => !existingYearsSet.has(year)
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/20">
          <FilePlus className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Nueva Declaración</h1>
          <p className="text-sm text-muted-foreground">
            Crea una declaración de renta para {client?.fullName || 'el cliente'}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-t-4 border-t-emerald-600 pt-0 gap-0">
        <div className="bg-emerald-600 px-6 py-4">
          <div className="flex items-center gap-2">
            <FilePlus className="h-5 w-5 text-white" />
            <CardTitle className="font-bold text-white">Información de la Declaración</CardTitle>
          </div>
        </div>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
            <Info className="h-4 w-4 text-emerald-500" /> Selecciona el año y elige cómo crear la declaración
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="taxableYear" className="flex items-center gap-2 font-bold">
                <Calendar className="h-4 w-4 text-emerald-500" /> Año de la Declaración
              </Label>
              <Controller
                name="taxableYear"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="taxableYear" className="w-full transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20">
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
              <Label className="flex items-center gap-2 font-bold">
                <Upload className="h-4 w-4 text-emerald-500" /> Archivo del Exógeno DIAN (Opcional)
              </Label>
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
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Procesar y Crear
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCreateEmpty}
                disabled={isLoading || !selectedYear || !!selectedFile}
                className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Crear Declaración Vacía
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
