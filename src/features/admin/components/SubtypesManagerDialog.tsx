'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { conceptSubtypeService } from '@/services';
import type { ConceptSubtype, ItemScope } from '@/types';
import { Loader2, Pencil, Plus, Tags, X } from 'lucide-react';

interface SubtypesManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ámbito gestionado (income hoy; asset/liability/custom cuando se exponga) */
  scope: ItemScope;
  /** Etiqueta legible del ámbito para los textos */
  scopeLabel: string;
  /** Requerido cuando scope === 'custom' */
  conceptTypeId?: string;
  types: ConceptSubtype[];
  /** Ítems por subtipo en la declaración actual */
  itemsCountBySubtype?: Record<string, number>;
  onChanged: () => void;
}

/**
 * Gestión autogestionada de subtipos por ámbito. Genérico: sirve para
 * ingresos hoy y para patrimonios/deudas/tipos el día que se expongan.
 */
export function SubtypesManagerDialog({
  open,
  onOpenChange,
  scope,
  scopeLabel,
  conceptTypeId,
  types,
  itemsCountBySubtype = {},
  onChanged,
}: SubtypesManagerDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Sin resets en effects: el padre remonta con key al abrir.

  const showError = (error: any, fallback: string) =>
    toast({
      title: 'Error',
      description: Array.isArray(error?.message) ? error.message[0] : error?.message || fallback,
      variant: 'destructive',
    });

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      setIsCreating(true);
      await conceptSubtypeService.create({
        name: name.trim(),
        scope,
        conceptTypeId,
        description: description.trim() || undefined,
      });
      toast({ title: 'Subtipo creado', description: `"${name.trim()}" ya está disponible en ${scopeLabel}.` });
      setName('');
      setDescription('');
      onChanged();
    } catch (error: any) {
      showError(error, 'Error al crear el subtipo');
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (type: ConceptSubtype) => {
    setEditingId(type.id);
    setEditName(type.name);
    setEditDescription(type.description ?? '');
    setConfirmDeleteId(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      setIsSavingEdit(true);
      await conceptSubtypeService.update(id, {
        name: editName.trim(),
        description: editDescription.trim() ? editDescription.trim() : null,
      });
      toast({ title: 'Subtipo actualizado', description: 'Los cambios se guardaron.' });
      setEditingId(null);
      onChanged();
    } catch (error: any) {
      showError(error, 'Error al actualizar el subtipo');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleActive = async (type: ConceptSubtype) => {
    try {
      setBusyId(type.id);
      await conceptSubtypeService.update(type.id, { isActive: !type.isActive });
      toast({
        title: type.isActive ? 'Subtipo desactivado' : 'Subtipo activado',
        description: type.isActive
          ? 'Ya no se ofrecerá para nuevos registros, pero los datos se conservan.'
          : 'Volverá a ofrecerse para nuevos registros.',
      });
      onChanged();
    } catch (error: any) {
      showError(error, 'Error al cambiar el estado');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await conceptSubtypeService.remove(id);
      toast({ title: 'Subtipo eliminado', description: 'El subtipo fue eliminado.' });
      setConfirmDeleteId(null);
      onChanged();
    } catch (error: any) {
      showError(error, 'Error al eliminar el subtipo');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto overflow-x-clip">
        <DialogHeader>
          <div className="bg-violet-600 -mx-6 -mt-6 px-6 py-4 border-b rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                <Tags className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-bold text-white">Subtipos de {scopeLabel}</DialogTitle>
                <DialogDescription className="text-violet-100">
                  Clasifique los registros con el detalle que necesite.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
          <Label htmlFor="new-subtype-name" className="font-bold text-sm">Nuevo subtipo</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="new-subtype-name"
              placeholder="Ej: Dividendos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              disabled={isCreating}
            />
            <Input
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              disabled={isCreating}
              aria-label="Descripción del nuevo subtipo"
            />
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || isCreating}
              className="bg-violet-500 hover:bg-violet-600 text-white font-bold shrink-0"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span className="sm:sr-only">Crear subtipo</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {types.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aún no hay subtipos. Cree el primero arriba.
            </p>
          )}
          {types.map((type) => {
            const count = itemsCountBySubtype[type.id] ?? 0;
            const isEditing = editingId === type.id;
            const isConfirmingDelete = confirmDeleteId === type.id;
            return (
              <div key={type.id} className="rounded-lg border p-3 space-y-2">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={100}
                      disabled={isSavingEdit}
                      aria-label="Nombre del subtipo"
                    />
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      maxLength={500}
                      placeholder="Descripción (opcional)"
                      disabled={isSavingEdit}
                      aria-label="Descripción del subtipo"
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)} disabled={isSavingEdit}>
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(type.id)}
                        disabled={!editName.trim() || isSavingEdit}
                        className="bg-violet-500 hover:bg-violet-600 text-white"
                      >
                        {isSavingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Guardar'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-bold">{type.name}</span>
                      <Badge variant={type.isActive ? 'default' : 'secondary'} className={type.isActive ? 'shrink-0 bg-violet-500/10 text-violet-600 border-violet-500/20' : 'shrink-0'}>
                        {type.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      {count > 0 && (
                        <Badge variant="outline" className="shrink-0 text-[11px]">
                          {count} registro{count !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    {type.description && (
                      <p className="text-xs text-muted-foreground break-words">{type.description}</p>
                    )}
                    {isConfirmingDelete ? (
                      <div className="flex items-center justify-between gap-2 rounded-md bg-destructive/10 px-2.5 py-2">
                        <span className="text-xs font-medium">
                          {count > 0
                            ? `Tiene ${count} registro(s): re-cataloga o elimina esos registros primero.`
                            : '¿Eliminar este subtipo?'}
                        </span>
                        <span className="flex gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={isDeleting}>
                            No
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(type.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Sí, eliminar'}
                          </Button>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(type)}
                          disabled={busyId === type.id}
                          className="h-8 text-xs"
                        >
                          {busyId === type.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : type.isActive ? (
                            'Desactivar'
                          ) : (
                            'Activar'
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(type)}
                          aria-label={`Editar ${type.name}`}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmDeleteId(type.id)}
                          aria-label={`Eliminar ${type.name}`}
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Los subtipos inactivos no se ofrecen para nuevos registros, pero los datos se conservan.
        </p>
      </DialogContent>
    </Dialog>
  );
}
