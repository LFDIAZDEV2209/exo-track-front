'use client';

import { useMemo, useState } from 'react';
import {
  TrendingUp,
  Building2,
  CreditCard,
  TriangleAlert,
  Trash2,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { formatCurrency } from '@/lib/utils';
import type { ExogenaCategory, ExogenaItem } from '@/lib/exogena-parser';

const CATEGORY_OPTIONS: { value: ExogenaCategory; label: string }[] = [
  { value: 'income', label: 'Ingreso' },
  { value: 'asset', label: 'Patrimonio' },
  { value: 'liability', label: 'Deuda' },
  { value: 'unclassified', label: 'Sin clasificar' },
];

const SECTIONS: { key: ExogenaCategory; label: string; icon: typeof TrendingUp; badge: string; headerClass: string }[] = [
  {
    key: 'income',
    label: 'Ingresos',
    icon: TrendingUp,
    badge: 'bg-emerald-100 text-emerald-700',
    headerClass: 'border-t-emerald-600',
  },
  {
    key: 'asset',
    label: 'Patrimonio',
    icon: Building2,
    badge: 'bg-sky-100 text-sky-700',
    headerClass: 'border-t-sky-600',
  },
  {
    key: 'liability',
    label: 'Deudas',
    icon: CreditCard,
    badge: 'bg-amber-100 text-amber-700',
    headerClass: 'border-t-amber-600',
  },
  {
    key: 'unclassified',
    label: 'Sin clasificar',
    icon: TriangleAlert,
    badge: 'bg-muted text-muted-foreground',
    headerClass: 'border-t-muted-foreground/40',
  },
];

interface ExogenaImportReviewProps {
  fileName: string;
  fileDocumentNumber: string | null;
  items: ExogenaItem[];
  onItemsChange: (items: ExogenaItem[]) => void;
  customerName: string;
  customerDocumentNumber: string;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function ExogenaImportReview({
  fileName,
  fileDocumentNumber,
  items,
  onItemsChange,
  customerName,
  customerDocumentNumber,
  onBack,
  onConfirm,
  isSubmitting,
}: ExogenaImportReviewProps) {
  const { byCategory, totalIncluded, totalAmount } = useMemo(() => {
    const byCategory = new Map<ExogenaCategory, ExogenaItem[]>();
    for (const section of SECTIONS) byCategory.set(section.key, []);

    let totalIncluded = 0;
    let totalAmount = 0;
    for (const item of items) {
      byCategory.get(item.category)?.push(item);
      if (item.category !== 'unclassified') {
        totalIncluded += 1;
        totalAmount += item.amount;
      }
    }
    return { byCategory, totalIncluded, totalAmount };
  }, [items]);

  const [focusedAmountId, setFocusedAmountId] = useState<string | null>(null);

  const updateItem = (id: string, patch: Partial<ExogenaItem>) => {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <Button variant="ghost" size="icon" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/20">
          <FileSpreadsheet className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Revisar importación</h1>
          <p className="text-sm text-muted-foreground">
            Verifica y corrige los datos detectados en el reporte exógeno antes de crear la declaración
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-t-4 border-t-emerald-600 pt-0 gap-0">
        <div className="bg-emerald-600 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-white" />
            <CardTitle className="font-bold text-white">Resumen del archivo</CardTitle>
          </div>
        </div>
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Archivo</p>
            <p className="font-medium text-sm truncate" title={fileName}>{fileName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cliente del archivo</p>
            <p className="font-medium text-sm">{fileDocumentNumber ? `C.C. ${fileDocumentNumber}` : '—'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cliente seleccionado</p>
            <p className="font-medium text-sm truncate" title={customerName}>{customerName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Registros a incluir</p>
            <p className="font-medium text-sm text-emerald-600 font-bold">{totalIncluded} ítems</p>
          </div>
        </CardContent>
      </Card>

      {fileDocumentNumber && fileDocumentNumber !== customerDocumentNumber && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-800 dark:text-amber-200">
          <TriangleAlert className="h-5 w-5 shrink-0" />
          <p>
            El reporte pertenece al documento{' '}
            <strong>{fileDocumentNumber}</strong>, pero estás creando la declaración para{' '}
            <strong>{customerName}</strong> ({customerDocumentNumber}). Verifica que sea el cliente correcto.
          </p>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm text-emerald-800 dark:text-emerald-200">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p>
          Edita el <strong>concepto</strong>, el <strong>valor</strong> y la <strong>categoría</strong> de cada
          registro si es necesario. Los registros sin clasificar no se incluirán en la declaración.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {SECTIONS.map((section) => {
          const sectionItems = byCategory.get(section.key) ?? [];
          const total = sectionItems.reduce((sum, item) => sum + item.amount, 0);
          const Icon = section.icon;
          return (
            <div key={section.key} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${section.badge}`}>
              <Icon className="h-4 w-4" />
              <span className="font-bold">{section.label}:</span>
              <span>{sectionItems.length}</span>
              {sectionItems.length > 0 && <span className="text-xs opacity-80">({formatCurrency(total)})</span>}
            </div>
          );
        })}
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-emerald-600 text-white">
          <span className="font-bold">Total:</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const sectionItems = byCategory.get(section.key) ?? [];
          if (sectionItems.length === 0) return null;
          const Icon = section.icon;
          const sectionTotal = sectionItems.reduce((sum, item) => sum + item.amount, 0);

          return (
            <Card key={section.key} className={`overflow-hidden border-t-4 pt-0 gap-0 ${section.headerClass}`}>
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-foreground" />
                  <CardTitle className="font-bold">{section.label}</CardTitle>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${section.badge}`}>
                    {sectionItems.length}
                  </span>
                </div>
                <span className="text-sm font-bold">Total: {formatCurrency(sectionTotal)}</span>
              </div>
              <CardContent className="p-6 space-y-4">
                {sectionItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_40px] gap-3 items-center rounded-lg border p-3 animate-in fade-in duration-300"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="space-y-1 min-w-0">
                      <Input
                        value={item.concept}
                        onChange={(e) => updateItem(item.id, { concept: e.target.value })}
                        className="font-medium"
                        aria-label="Concepto"
                      />
                      {item.sourceDetail && (
                        <p className="text-xs text-muted-foreground truncate" title={item.sourceDetail}>
                          {item.sourceDetail}
                        </p>
                      )}
                    </div>
                    <Input
                      type="text"
                      value={
                        focusedAmountId === item.id
                          ? (Number.isFinite(item.amount) ? String(item.amount) : '')
                          : (Number.isFinite(item.amount) ? formatCurrency(item.amount) : '')
                      }
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.-]/g, '');
                        const parsed = parseFloat(raw);
                        updateItem(item.id, { amount: Number.isNaN(parsed) ? 0 : parsed });
                      }}
                      onFocus={(e) => {
                        setFocusedAmountId(item.id);
                        e.target.select();
                      }}
                      onBlur={() => setFocusedAmountId(null)}
                      aria-label="Valor"
                    />
                    <Select
                      value={item.category}
                      onValueChange={(value) => updateItem(item.id, { category: value as ExogenaCategory })}
                    >
                      <SelectTrigger aria-label="Categoría">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                      aria-label="Eliminar registro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No hay registros. Vuelve atrás y selecciona otro archivo.
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Volver
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting || totalIncluded === 0}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando declaración...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Crear Declaración con {totalIncluded} registros
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
