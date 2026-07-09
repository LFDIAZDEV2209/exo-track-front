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
import { userService } from '@/services';
import { Loader2, TriangleAlert, Trash2 } from 'lucide-react';

interface DeleteCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  onDeleted?: () => void;
}

export function DeleteCustomerDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  onDeleted,
}: DeleteCustomerDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await userService.remove(customerId);
      
      toast({
        title: 'Cliente eliminado',
        description: `El cliente ${customerName} ha sido eliminado exitosamente`,
      });

      onOpenChange(false);
      onDeleted?.();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Error al eliminar el cliente',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
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
                Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente{' '}
                <strong>{customerName}</strong> y todos sus datos asociados.
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
