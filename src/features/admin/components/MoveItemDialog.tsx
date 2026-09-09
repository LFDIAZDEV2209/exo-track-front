'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { declarationService, type MoveItemFromKind, type MoveItemToKind } from '@/services';
import type { ConceptType } from '@/types';
import { ArrowRightLeft, Building2, Check, CreditCard, Loader2, Shapes, TrendingUp } from 'lucide-react';

export interface MoveItemTarget {
  id: string;
  concept: string;
  amount: number | string;
  kind: MoveItemFromKind;
  /** Solo cuando kind === 'custom' */
  customTypeId?: string;
  customTypeName?: string;
}

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  declarationId: string;
  item: MoveItemTarget | null;
  conceptTypes: ConceptType[];
  onMoved: () => void;
}

const KIND_LABELS: Record<MoveItemFromKind, string> = {
  asset: 'Patrimonio',
  income: 'Ingreso',
  liability: 'Deuda',
  custom: 'Personalizado',
  unclassified: 'Sin catalogar',
};

export function MoveItemDialog({
  open,
  onOpenChange,
  declarationId,
  item,
  conceptTypes,
  onMoved,
}: MoveItemDialogProps) {
  const { toast } = useToast();
  // Sin estado inicial que resetear: el padre remonta con key={item.id} por ítem.
  const [destination, setDestination] = useState<{ to: MoveItemToKind; customTypeId?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!item) return null;

  const activeCustomTypes = conceptTypes.filter((t) => t.isActive);
  const currentLabel =
    item.kind === 'custom' ? (item.customTypeName ?? 'Personalizado') : KIND_LABELS[item.kind];

  const handleConfirm = async () => {
    if (!destination) return;
    try {
      setIsSaving(true);
      await declarationService.moveItem(declarationId, {
        itemId: item.id,
        from: item.kind,
        to: destination.to,
        ...(destination.to === 'custom' ? { customTypeId: destination.customTypeId } : {}),
      });
      const destLabel =
        destination.to === 'custom'
          ? (conceptTypes.find((t) => t.id === destination.customTypeId)?.name ?? 'tipo personalizado')
          : KIND_LABELS[destination.to];
      toast({
        title: item.kind === 'unclassified' ? 'Concepto catalogado' : 'Registro movido',
        description: `"${item.concept}" ahora está en ${destLabel}.`,
      });
      onOpenChange(false);
      onMoved();
    } catch (error: any) {
      const errorMessage = Array.isArray(error?.message)
        ? error.message[0]
        : error?.message || 'Error al mover el registro';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const isCurrent = (to: MoveItemToKind, customTypeId?: string) =>
    item.kind === to && (to !== 'custom' || item.customTypeId === customTypeId);

  const options: Array<{ to: MoveItemToKind; customTypeId?: string; label: string; icon: typeof Building2 }> = [
    { to: 'asset', label: 'Patrimonio', icon: Building2 },
    { to: 'income', label: 'Ingreso', icon: TrendingUp },
    { to: 'liability', label: 'Deuda', icon: CreditCard },
    ...activeCustomTypes.map((t) => ({
      to: 'custom' as MoveItemToKind,
      customTypeId: t.id,
      label: t.name,
      icon: Shapes,
    })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="bg-emerald-600 -mx-6 -mt-6 px-6 py-4 border-b rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <ArrowRightLeft className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="font-bold text-white">
                  {item.kind === 'unclassified' ? 'Catalogar concepto' : 'Mover registro'}
                </DialogTitle>
                <DialogDescription className="text-emerald-100">
                  Elige el tipo destino. El movimiento es atómico: no se pierde ni se duplica.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
          <p className="truncate text-sm font-bold">{item.concept}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatCurrency(typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount)}</span>
            <Badge variant="secondary" className="text-[11px]">{currentLabel}</Badge>
          </div>
        </div>

        <div className="grid gap-2" role="radiogroup" aria-label="Tipo destino">
          {options.map((option) => {
            const Icon = option.icon;
            const disabled = isCurrent(option.to, option.customTypeId);
            const selected =
              destination?.to === option.to && destination?.customTypeId === option.customTypeId;
            return (
              <button
                key={option.to === 'custom' ? `custom-${option.customTypeId}` : option.to}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled || isSaving}
                onClick={() => setDestination({ to: option.to, customTypeId: option.customTypeId })}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 ${
                  selected
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700'
                    : 'hover:border-emerald-500/50 hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="flex-1">{option.label}</span>
                {option.to === 'custom' && (
                  <Badge variant="outline" className="text-[10px]">Personalizado</Badge>
                )}
                {disabled && <span className="text-[11px] text-muted-foreground">Actual</span>}
                {selected && <Check className="h-4 w-4" aria-hidden />}
              </button>
            );
          })}
          {activeCustomTypes.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No hay tipos personalizados activos. Créelos en “Gestionar tipos”.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!destination || isSaving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Moviendo…
              </>
            ) : (
              <>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                {item.kind === 'unclassified' ? 'Catalogar' : 'Mover'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
