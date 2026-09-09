'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  downloadDeclarationExcel,
  downloadDeclarationPdf,
  type DeclarationReportData,
} from '@/lib/declaration-report';
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

interface DeclarationReportButtonsProps {
  /** null mientras cargan los datos (deshabilita los botones) */
  report: DeclarationReportData | null;
}

/**
 * Descarga del reporte completo de la declaración (Excel + PDF).
 * Comparte implementación entre la vista admin y la vista user.
 */
export function DeclarationReportButtons({ report }: DeclarationReportButtonsProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<'excel' | 'pdf' | null>(null);

  const handleDownload = async (format: 'excel' | 'pdf') => {
    if (!report || busy) return;
    try {
      setBusy(format);
      // Cede el hilo para que el spinner pinte antes del trabajo pesado
      await new Promise((resolve) => setTimeout(resolve, 30));
      if (format === 'excel') {
        await downloadDeclarationExcel(report);
      } else {
        await downloadDeclarationPdf(report);
      }
      toast({
        title: 'Reporte descargado',
        description: `El archivo ${format === 'excel' ? 'Excel' : 'PDF'} se generó correctamente.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo generar el reporte.',
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDownload('excel')}
        disabled={!report || busy !== null}
        aria-label="Descargar reporte en Excel"
        title="Descargar reporte en Excel"
      >
        {busy === 'excel' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
        )}
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDownload('pdf')}
        disabled={!report || busy !== null}
        aria-label="Descargar reporte en PDF"
        title="Descargar reporte en PDF"
      >
        {busy === 'pdf' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileText className="mr-2 h-4 w-4 text-red-500" />
        )}
        PDF
      </Button>
    </div>
  );
}
