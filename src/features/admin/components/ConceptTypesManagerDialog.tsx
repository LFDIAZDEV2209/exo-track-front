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
import { conceptTypeService } from '@/services';
import type { ConceptType } from '@/types';
import { Loader2, Pencil, Plus, Shapes, X } from 'lucide-react';

interface ConceptTypesManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  types: ConceptType[];
  /** Ítems por tipo en la declaración actual (para contextualizar el borrado) */
  itemsCountByType?: Record<string, number>;
  onChanged: () => void;
}

export function ConceptTypesManagerDialog({
  open,
  onOpenChange,
  types,
  itemsCountByType = {},
  onChanged,
}: ConceptTypesManagerDialogProps) {
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
      await conceptTypeService.create({ name: name.trim(), description: description.trim() || undefined });
      toast({ title: 'Tipo creado', description: `"${name.trim()}" ya está disponible como pestaña.` });
      setName('');
      setDescription('');
      onChanged();
    } catch (error: any) {
      showError(error, 'Error al crear el tipo');
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (type: ConceptType) => {
    setEditingId(type.id);
    setEditName(type.name);
    setEditDescription(type.description ?? '');
    setConfirmDeleteId(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      setIsSavingEdit(true);
      await conceptTypeService.update(id, {
        name: editName.trim(),
        description: editDescription.trim() ? editDescription.trim() : null,
      });
      toast({ title: 'Tipo actualizado', description: 'Los cambios se guardaron.' });
      setEditingId(null);
      onChanged();
    } catch (error: any) {
      showError(error, 'Error al actualizar el tipo');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleActive = async (type: ConceptType) => {
    try {
      setBusyId(type.id);
      await conceptTypeService.update(type.id, { isActive: !type.isActive });
      toast({
        title: type.isActive ? 'Tipo desactivado' : 'Tipo activado',
        description: type.isActive
          ? 'Ya no aparecerá como pestaña para nuevos registros.'
          : 'Volverá a aparecer como pestaña.',
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
      await conceptTypeService.remove(id);
      toast({ title: 'Tipo eliminado', description: 'El tipo fue eliminado.' });
      setConfirmDeleteId(null);
      onChanged();
    } catch (error: any) {
      showError(error, 'Error al eliminar el tipo');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="bg-emerald-600 -mx-6 -mt-6 px-6 py-4 border-b rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <Shapes className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="font-bold text-white">Tipos de concepto</DialogTitle>
                <DialogDescription className="text-emerald-100">
                  Cree y gestione pestañas personalizadas (Vehículos, Inversiones…).
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
          <Label htmlFor="new-type-name" className="font-bold text-sm">Nuevo tipo</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="new-type-name"
              placeholder="Ej: Vehículos"
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
              aria-label="Descripción del nuevo tipo"
            />
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || isCreating}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shrink-0"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span className="sm:sr-only">Crear tipo</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {types.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aún no hay tipos personalizados. Cree el primero arriba.
            </p>
          )}
          {types.map((type) => {
            const count = itemsCountByType[type.id] ?? 0;
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
                      aria-label="Nombre del tipo"
                    />
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      maxLength={500}
                      placeholder="Descripción (opcional)"
                      disabled={isSavingEdit}
                      aria-label="Descripción del tipo"
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)} disabled={isSavingEdit}>
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(type.id)}
                        disabled={!editName.trim() || isSavingEdit}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        {isSavingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Guardar'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="flex-1 truncate text-sm font-bold">{type.name}</span>
                      <Badge variant={type.isActive ? 'default' : 'secondary'} className={type.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : ''}>
                        {type.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      {count > 0 && (
                        <Badge variant="outline" className="text-[11px]">
                          {count} registro{count !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    {type.description && (
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    )}
                    {isConfirmingDelete ? (
                      <div className="flex items-center justify-between gap-2 rounded-md bg-destructive/10 px-2.5 py-2">
                        <span className="text-xs font-medium">
                          {count > 0
                            ? `Tiene ${count} registro(s): re-catalogue o elimínelos primero.`
                            : '¿Eliminar este tipo?'}
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
          Los tipos inactivos no aparecen como pestaña para nuevos registros, pero sus datos se conservan.
        </p>
      </DialogContent>
    </Dialog>
  );
}
