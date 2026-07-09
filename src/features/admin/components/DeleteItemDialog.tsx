'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TriangleAlert, Trash2 } from 'lucide-react';

interface DeleteItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemConcept: string;
  itemType: 'asset' | 'income' | 'liability';
  onDeleted: () => void;
  deleteService: (id: string) => Promise<void>;
}

export function DeleteItemDialog({
  open,
  onOpenChange,
  itemId,
  itemConcept,
  itemType,
  onDeleted,
  deleteService,
}: DeleteItemDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteService(itemId);
      
      const itemTypeLabel = itemType === 'asset' ? 'patrimonio' : itemType === 'income' ? 'ingreso' : 'deuda';
      
      toast({
        title: 'Registro eliminado',
        description: `El ${itemTypeLabel} ha sido eliminado exitosamente`,
      });

      onOpenChange(false);
      onDeleted();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      const errorMessage = Array.isArray(error?.message)
        ? error.message[0]
        : error?.message || 'Error al eliminar el registro';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getItemTypeLabel = () => {
    switch (itemType) {
      case 'asset':
        return 'patrimonio';
      case 'income':
        return 'ingreso';
      case 'liability':
        return 'deuda';
      default:
        return 'registro';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <TriangleAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="font-bold">¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el {getItemTypeLabel()}{' '}
                <strong>{itemConcept}</strong>.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
