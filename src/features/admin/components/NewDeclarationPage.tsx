'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Loader2, ArrowLeft, FilePlus, Info, Calendar, Upload, FileUp, XCircle, FileSpreadsheet } from 'lucide-react';
import { FileUpload } from '@/shared/layout/file-upload';
import { ExogenaImportReview } from './ExogenaImportReview';
import { parseExogenaFile, type ExogenaItem, type ExogenaParseResult } from '@/lib/exogena-parser';
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
  const [isParsing, setIsParsing] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [existingYears, setExistingYears] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedFile, setParsedFile] = useState<ExogenaParseResult | null>(null);
  const [reviewItems, setReviewItems] = useState<ExogenaItem[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);

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
    setValue,
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

  const handleFileSelect = useCallback(
    async (file: File | null) => {
      setSelectedFile(file);
      setParsedFile(null);
      setReviewItems([]);
      setIsReviewing(false);

      if (!file) return;

      try {
        setIsParsing(true);
        const result = await parseExogenaFile(file);

        if (result.items.length === 0) {
          toast({
            title: 'Sin registros detectados',
            description: 'No se encontraron datos de ingresos, patrimonio o deudas en el archivo.',
            variant: 'destructive',
          });
          return;
        }

        setParsedFile(result);
        setReviewItems(result.items);

        if (result.taxableYear && !getValues('taxableYear')) {
          if (existingYearsSet.has(result.taxableYear)) {
            toast({
              title: 'Año ya registrado',
              description: `El archivo es del año ${result.taxableYear}, pero ese cliente ya tiene una declaración para ese año.`,
              variant: 'destructive',
            });
          } else {
            setValue('taxableYear', result.taxableYear);
          }
        }

        toast({
          title: 'Archivo procesado',
          description: `Se detectaron ${result.items.length} registros del reporte exógeno`,
        });
      } catch (error: any) {
        console.error('Error parsing file:', error);
        toast({
          title: 'Error al procesar el archivo',
          description: error?.message || 'El archivo no tiene el formato esperado del reporte exógeno.',
          variant: 'destructive',
        });
      } finally {
        setIsParsing(false);
      }
    },
    [existingYearsSet, getValues, setValue, toast]
  );

  const onSubmit = async (data: DeclarationFormData) => {
    // Si hay archivo cargado, la creación pasa por la revisión del exógeno
    if (selectedFile) {
      handleGoToReview();
      return;
    }

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

  const handleGoToReview = () => {
    const formValues = getValues();
    if (!formValues?.taxableYear) {
      toast({
        title: 'Año requerido',
        description: 'Por favor selecciona el año de la declaración',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedFile) {
      toast({
        title: 'Archivo requerido',
        description: 'Selecciona el archivo del reporte exógeno para procesar',
        variant: 'destructive',
      });
      return;
    }
    if (reviewItems.length === 0) {
      toast({
        title: 'Sin registros para procesar',
        description: 'El archivo no contiene registros válidos',
        variant: 'destructive',
      });
      return;
    }
    setIsReviewing(true);
  };

  const handleConfirmImport = async () => {
    const year = getValues('taxableYear');
    if (!year) return;

    const sanitize = (item: ExogenaItem) => ({
      concept: item.concept.trim(),
      amount: item.amount,
      sourceDetail: item.sourceDetail || undefined,
    });

    const assets = reviewItems
      .filter((item) => item.category === 'asset' && item.concept.trim() && item.amount > 0)
      .map(sanitize);
    const incomes = reviewItems
      .filter((item) => item.category === 'income' && item.concept.trim() && item.amount > 0)
      .map(sanitize);
    const liabilities = reviewItems
      .filter((item) => item.category === 'liability' && item.concept.trim() && item.amount > 0)
      .map(sanitize);

    if (assets.length + incomes.length + liabilities.length === 0) {
      toast({
        title: 'No hay registros válidos',
        description: 'Clasifica al menos un registro en Ingresos, Patrimonio o Deudas para crear la declaración.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await declarationService.createFromExogena({
        userId: customerId,
        taxableYear: year,
        description: `Declaración de renta ${year} - Exógena DIAN`,
        assets,
        incomes,
        liabilities,
      });

      toast({
        title: 'Declaración creada desde exógena',
        description: `Se importaron ${response.counts.assets} patrimonios, ${response.counts.incomes} ingresos y ${response.counts.liabilities} deudas.`,
      });

      router.push(`/admin/customers/${customerId}/declarations/${response.declaration.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear la declaración desde el archivo',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setIsReviewing(false);
  };

  if (isReviewing && parsedFile) {
    return (
      <ExogenaImportReview
        fileName={selectedFile?.name || ''}
        fileDocumentNumber={parsedFile.documentNumber}
        items={reviewItems}
        onItemsChange={setReviewItems}
        customerName={client?.fullName || 'el cliente'}
        customerDocumentNumber={client?.documentNumber || ''}
        onBack={handleBackToForm}
        onConfirm={handleConfirmImport}
        isSubmitting={isLoading}
      />
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
                    disabled={isLoading || isParsing}
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
                onFileSelect={handleFileSelect}
                accept=".xlsx,.xls"
                disabled={isLoading}
              />
              {isParsing && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Procesando el archivo...
                </p>
              )}
              {parsedFile && !isParsing && (
                <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-sm text-emerald-800 dark:text-emerald-200">
                  <FileSpreadsheet className="h-5 w-5 shrink-0" />
                  <p className="flex-1">
                    <strong>{parsedFile.items.length} registros</strong> detectados
                    {parsedFile.taxableYear ? ` · año ${parsedFile.taxableYear}` : ''}
                    {parsedFile.fullName ? ` · ${parsedFile.fullName}` : ''}
                    {' — '}
                    {parsedFile.items.filter((i) => i.category === 'income').length} ingresos,{' '}
                    {parsedFile.items.filter((i) => i.category === 'asset').length} patrimonios,{' '}
                    {parsedFile.items.filter((i) => i.category === 'liability').length} deudas,{' '}
                    {parsedFile.items.filter((i) => i.category === 'unclassified').length} sin clasificar
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Puedes crear la declaración sin archivo y agregar los datos manualmente después
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handleGoToReview}
                disabled={isLoading || !selectedYear || !selectedFile || isParsing}
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
                    Procesar y Revisar
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
