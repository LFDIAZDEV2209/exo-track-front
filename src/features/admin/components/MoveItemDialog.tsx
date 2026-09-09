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
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { declarationService, type MoveItemFromKind, type MoveItemToKind } from '@/services';
import type { ConceptType, ConceptSubtype } from '@/types';
import { ArrowRightLeft, Building2, Check, CreditCard, Loader2, Shapes, TrendingUp } from 'lucide-react';

export interface MoveItemTarget {
  id: string;
  concept: string;
  amount: number | string;
  kind: MoveItemFromKind;
  /** Solo cuando kind === 'custom' */
  customTypeId?: string;
  customTypeName?: string;
  subtypeId?: string;
  subtypeName?: string;
}

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  declarationId: string;
  item: MoveItemTarget | null;
  conceptTypes: ConceptType[];
  subtypes: ConceptSubtype[];
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
  subtypes,
  onMoved,
}: MoveItemDialogProps) {
  const { toast } = useToast();
  // Sin estado inicial que resetear: el padre remonta con key={item.id} por ítem.
  const [destination, setDestination] = useState<{ to: MoveItemToKind; customTypeId?: string } | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  if (!item) return null;

  const activeCustomTypes = conceptTypes.filter((t) => t.isActive);
  const currentLabel =
    item.kind === 'custom' ? (item.customTypeName ?? 'Personalizado') : KIND_LABELS[item.kind];

  const handleConfirm = async () => {
    if (!destination) return;
    try {
      setIsSaving(true);
      const result = await declarationService.moveItem(declarationId, {
        itemId: item.id,
        from: item.kind,
        to: destination.to,
        ...(destination.to === 'custom' ? { customTypeId: destination.customTypeId } : {}),
        ...(selectedSubtype ? { subtypeId: selectedSubtype } : {}),
      });
      const destLabel =
        destination.to === 'custom'
          ? (conceptTypes.find((t) => t.id === destination.customTypeId)?.name ?? 'tipo personalizado')
          : KIND_LABELS[destination.to];
      toast({
        title: item.kind === 'unclassified' ? 'Concepto catalogado' : 'Registro movido',
        description: `"${item.concept}" ahora está en ${destLabel}.${
          result.subtypeCleared ? ' Se quitó el subtipo anterior por el cambio de ámbito.' : ''
        }`,
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

  // Subtipos ofrecidos según el destino elegido (mismo ámbito + tipo)
  const destScope = destination
    ? destination.to === 'custom'
      ? 'custom'
      : destination.to
    : null;
  const destSubtypes = destination
    ? subtypes.filter(
        (s) =>
          s.isActive &&
          s.scope === destScope &&
          (destScope !== 'custom' || s.conceptType?.id === destination.customTypeId),
      )
    : [];
  const destSubtypeName = (id: string) => destSubtypes.find((s) => s.id === id)?.name;

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
      <DialogContent className="sm:max-w-md overflow-x-clip">
        <DialogHeader>
          <div className="bg-emerald-600 -mx-6 -mt-6 px-6 py-4 border-b rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                <ArrowRightLeft className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
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

        <div className="min-w-0 rounded-lg border bg-muted/40 px-3 py-2.5">
          <p className="text-sm font-bold break-words line-clamp-2">{item.concept}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="shrink-0">{formatCurrency(typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount)}</span>
            <Badge variant="secondary" className="shrink-0 text-[11px]">{currentLabel}</Badge>
            {item.subtypeName && (
              <Badge variant="outline" className="shrink-0 border-violet-500/30 bg-violet-500/10 text-[11px] font-semibold text-violet-700 dark:text-violet-400">
                {item.subtypeName}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid min-w-0 gap-2" role="radiogroup" aria-label="Tipo destino">
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
                onClick={() => {
                  setDestination({ to: option.to, customTypeId: option.customTypeId });
                  setSelectedSubtype('');
                }}
                className={`flex min-w-0 w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 ${
                  selected
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700'
                    : 'hover:border-emerald-500/50 hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 break-words">{option.label}</span>
                {option.to === 'custom' && (
                  <Badge variant="outline" className="shrink-0 text-[10px]">Personalizado</Badge>
                )}
                {disabled && <span className="shrink-0 text-[11px] text-muted-foreground">Actual</span>}
                {selected && <Check className="h-4 w-4 shrink-0" aria-hidden />}
              </button>
            );
          })}
          {activeCustomTypes.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No hay tipos personalizados activos. Créelos en “Gestionar tipos”.
            </p>
          )}
        </div>

        {destination && (
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">
              Subtipo en destino (opcional)
            </Label>
            {destSubtypes.length > 0 ? (
              <Select
                value={selectedSubtype || 'keep'}
                onValueChange={(value) => setSelectedSubtype(value === 'keep' ? '' : value)}
              >
                <SelectTrigger aria-label="Subtipo en destino">
                  <SelectValue placeholder="Conservar / sin subtipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">
                    {item.subtypeName && destSubtypes.some((s) => s.id === item.subtypeId)
                      ? `Conservar “${item.subtypeName}”`
                      : 'Sin subtipo'}
                  </SelectItem>
                  {destSubtypes.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-muted-foreground">
                Sin subtipos en este destino
                {item.subtypeName ? ': se quitará el actual.' : '.'}
              </p>
            )}
          </div>
        )}

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
