'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const itemSchema = z.object({
  concept: z.string().min(1, 'El concepto es requerido'),
  amount: z
    .string()
    .min(1, 'El monto es requerido')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'El monto debe ser un número positivo'),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (wasCreated: boolean) => void;
  itemType: 'asset' | 'income' | 'liability';
  declarationId: string;
  editingItem?: {
    id: string;
    concept: string;
    amount: number;
  } | null;
  createService: (data: { declarationId: string; concept: string; amount: number }) => Promise<any>;
  updateService: (id: string, data: { concept?: string; amount?: number }) => Promise<any>;
}

export function ItemFormDialog({
  open,
  onOpenChange,
  onSuccess,
  itemType,
  declarationId,
  editingItem,
  createService,
  updateService,
}: ItemFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ItemFormData>({
    // @ts-ignore - Compatibilidad de tipos entre zod y @hookform/resolvers
    resolver: zodResolver(itemSchema),
    defaultValues: {
      concept: '',
      amount: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingItem) {
        reset({
          concept: editingItem.concept,
          amount: editingItem.amount.toString(),
        });
      } else {
        reset({
          concept: '',
          amount: '',
        });
      }
    }
  }, [editingItem, open, reset]);

  const onSubmit = async (data: ItemFormData) => {
    try {
      setIsLoading(true);
      const amount = parseFloat(data.amount);

      if (editingItem) {
        // Actualizar
        await updateService(editingItem.id, {
          concept: data.concept,
          amount: amount,
        });
        toast({
          title: 'Registro actualizado',
          description: 'El registro ha sido actualizado exitosamente',
        });
      } else {
        // Crear
        await createService({
          declarationId,
          concept: data.concept,
          amount: amount,
        });
        toast({
          title: 'Registro creado',
          description: 'El registro ha sido creado exitosamente',
        });
      }

      onOpenChange(false);
      onSuccess(!editingItem); // true si fue creación, false si fue edición
    } catch (error: any) {
      const errorMessage = Array.isArray(error?.message)
        ? error.message[0]
        : error?.message || 'Error al guardar el registro';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getItemTypeLabel = () => {
    switch (itemType) {
      case 'asset':
        return 'Patrimonio';
      case 'income':
        return 'Ingreso';
      case 'liability':
        return 'Deuda';
      default:
        return 'Registro';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? `Editar ${getItemTypeLabel()}` : `Nuevo ${getItemTypeLabel()}`}
          </DialogTitle>
          <DialogDescription>
            {editingItem
              ? `Modifica la información del ${getItemTypeLabel().toLowerCase()}`
              : `Completa la información para crear un nuevo ${getItemTypeLabel().toLowerCase()}`}
          </DialogDescription>
        </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: '100ms' }}>
              <Label htmlFor="concept">Concepto</Label>
            <Input
              id="concept"
              {...register('concept')}
              placeholder="Ej: Préstamo hipotecario"
              disabled={isLoading}
            />
            {errors.concept && (
              <p className="text-sm text-destructive">{errors.concept.message}</p>
            )}
          </div>

          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: '200ms' }}>
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...register('amount')}
              placeholder="0.00"
              disabled={isLoading}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingItem ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                editingItem ? 'Actualizar' : 'Crear'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

