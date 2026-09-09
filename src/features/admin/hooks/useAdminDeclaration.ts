'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  declarationService,
  incomeService,
  assetService,
  liabilityService,
  userService,
  conceptTypeService,
  customItemService,
  unclassifiedItemService,
} from '@/services';
import { useToast } from '@/hooks/use-toast';
import { DeclarationStatus, type ConceptType } from '@/types';
import type { MoveItemTarget } from '../components/MoveItemDialog';

// Tope de carga completa por colección: las pestañas filtran/ordenan/paginan
// en cliente sobre esta lista (rápido, cero requests extra). Si una declaración
// superara este volumen, el backend seguiría paginando sin romperse.
const FULL_LIST_LIMIT = 1000;

const toNumber = (value: unknown): number => {
  const num = typeof value === 'string' ? parseFloat(value) : (value as number);
  return Number.isFinite(num) ? num : 0;
};

export function useAdminDeclaration(declarationId: string, customerId: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [declaration, setDeclaration] = useState<any>(null);
  const [client, setClient] = useState<any>(null);

  // Listas completas por colección (una sola petición cada una)
  const [assets, setAssets] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [unclassifiedItems, setUnclassifiedItems] = useState<any[]>([]);
  const [conceptTypes, setConceptTypes] = useState<ConceptType[]>([]);

  const [observations, setObservations] = useState('');
  const [deleteDeclarationDialogOpen, setDeleteDeclarationDialogOpen] = useState(false);
  const [isDeletingDeclaration, setIsDeletingDeclaration] = useState(false);

  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [deleteAssetDialogOpen, setDeleteAssetDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<{ id: string; concept: string } | null>(null);

  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any | null>(null);
  const [deleteIncomeDialogOpen, setDeleteIncomeDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<{ id: string; concept: string } | null>(null);

  const [liabilityFormOpen, setLiabilityFormOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState<any | null>(null);
  const [deleteLiabilityDialogOpen, setDeleteLiabilityDialogOpen] = useState(false);
  const [liabilityToDelete, setLiabilityToDelete] = useState<{ id: string; concept: string } | null>(null);

  // Ítems personalizados: el diálogo necesita el tipo activo
  const [customFormOpen, setCustomFormOpen] = useState(false);
  const [customFormTypeId, setCustomFormTypeId] = useState<string | null>(null);
  const [editingCustomItem, setEditingCustomItem] = useState<any | null>(null);
  const [deleteCustomDialogOpen, setDeleteCustomDialogOpen] = useState(false);
  const [customToDelete, setCustomToDelete] = useState<{ id: string; concept: string; typeName: string } | null>(null);

  // No catalogados: solo catalogar (mover) o descartar
  const [deleteUnclassifiedDialogOpen, setDeleteUnclassifiedDialogOpen] = useState(false);
  const [unclassifiedToDelete, setUnclassifiedToDelete] = useState<{ id: string; concept: string } | null>(null);

  // Mover / re-catalogar + gestionar tipos
  const [moveTarget, setMoveTarget] = useState<MoveItemTarget | null>(null);
  const [typesManagerOpen, setTypesManagerOpen] = useState(false);

  const loadItems = useCallback(async () => {
    const [assetsRes, incomesRes, liabilitiesRes, customRes, unclassifiedRes] = await Promise.all([
      assetService.findAllWithPagination({ limit: FULL_LIST_LIMIT, offset: 0 }, declarationId),
      incomeService.findAllWithPagination({ limit: FULL_LIST_LIMIT, offset: 0 }, declarationId),
      liabilityService.findAllWithPagination({ limit: FULL_LIST_LIMIT, offset: 0 }, declarationId),
      customItemService.findAllWithPagination({ limit: FULL_LIST_LIMIT, offset: 0 }, declarationId),
      unclassifiedItemService.findAllWithPagination({ limit: FULL_LIST_LIMIT, offset: 0 }, declarationId),
    ]);
    setAssets(assetsRes.assets);
    setIncomes(incomesRes.incomes);
    setLiabilities(liabilitiesRes.liabilities);
    setCustomItems(customRes.items);
    setUnclassifiedItems(unclassifiedRes.items);
  }, [declarationId]);

  const loadTypes = useCallback(async () => {
    setConceptTypes(await conceptTypeService.findAll());
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [decl, clientData] = await Promise.all([
          declarationService.findOne(declarationId),
          userService.findOne(customerId),
        ]);

        setDeclaration(decl);
        setClient(clientData);
        setObservations(decl?.description || '');

        await Promise.all([loadItems(), loadTypes()]);
      } catch (error) {
        console.error('Error loading declaration:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [declarationId, customerId, loadItems, loadTypes]);

  /** Recarga ítems + tipos tras mover/catalogar (afecta dos colecciones). */
  const refreshAfterMove = useCallback(async () => {
    await Promise.all([loadItems(), loadTypes()]);
  }, [loadItems, loadTypes]);

  const handleFinalize = async () => {
    try {
      await declarationService.update(declarationId, {
        status: DeclarationStatus.COMPLETED,
      });
      setDeclaration({ ...declaration, status: DeclarationStatus.COMPLETED });
      toast({
        title: 'Declaración finalizada',
        description: 'La declaración ha sido finalizada exitosamente',
      });
    } catch (error: any) {
      const errorMessage = Array.isArray(error?.message)
        ? error.message[0]
        : error?.message || 'Error al finalizar la declaración';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateObservations = async () => {
    try {
      await declarationService.update(declarationId, {
        description: observations,
      });
      setDeclaration({ ...declaration, description: observations });
      toast({
        title: 'Observaciones actualizadas',
        description: 'Las observaciones han sido guardadas',
      });
    } catch (error: any) {
      const errorMessage = Array.isArray(error?.message)
        ? error.message[0]
        : error?.message || 'Error al actualizar observaciones';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDeclaration = async () => {
    try {
      setIsDeletingDeclaration(true);
      await declarationService.remove(declarationId);

      toast({
        title: 'Declaración eliminada',
        description: 'La declaración ha sido eliminada exitosamente',
      });

      router.push(`/admin/customers/${customerId}`);
    } catch (error: any) {
      const errorMessage = Array.isArray(error?.message)
        ? error.message[0]
        : error?.message || 'Error al eliminar la declaración';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeletingDeclaration(false);
      setDeleteDeclarationDialogOpen(false);
    }
  };

  const handleCreateAsset = () => {
    setEditingAsset(null);
    setAssetFormOpen(true);
  };

  const handleEditAsset = (id: string) => {
    const asset = assets.find((a) => a.id === id);
    if (asset) {
      setEditingAsset(asset);
      setAssetFormOpen(true);
    }
  };

  const handleDeleteAsset = (id: string) => {
    const asset = assets.find((a) => a.id === id);
    if (asset) {
      setAssetToDelete({ id, concept: asset.concept });
      setDeleteAssetDialogOpen(true);
    }
  };

  const handleCreateIncome = () => {
    setEditingIncome(null);
    setIncomeFormOpen(true);
  };

  const handleEditIncome = (id: string) => {
    const income = incomes.find((i) => i.id === id);
    if (income) {
      setEditingIncome(income);
      setIncomeFormOpen(true);
    }
  };

  const handleDeleteIncome = (id: string) => {
    const income = incomes.find((i) => i.id === id);
    if (income) {
      setIncomeToDelete({ id, concept: income.concept });
      setDeleteIncomeDialogOpen(true);
    }
  };

  const handleCreateLiability = () => {
    setEditingLiability(null);
    setLiabilityFormOpen(true);
  };

  const handleEditLiability = (id: string) => {
    const liability = liabilities.find((l) => l.id === id);
    if (liability) {
      setEditingLiability(liability);
      setLiabilityFormOpen(true);
    }
  };

  const handleDeleteLiability = (id: string) => {
    const liability = liabilities.find((l) => l.id === id);
    if (liability) {
      setLiabilityToDelete({ id, concept: liability.concept });
      setDeleteLiabilityDialogOpen(true);
    }
  };

  const handleCreateCustomItem = (conceptTypeId: string) => {
    setEditingCustomItem(null);
    setCustomFormTypeId(conceptTypeId);
    setCustomFormOpen(true);
  };

  const handleEditCustomItem = (id: string) => {
    const item = customItems.find((c) => c.id === id);
    if (item) {
      setEditingCustomItem(item);
      setCustomFormTypeId(item.conceptType?.id ?? null);
      setCustomFormOpen(true);
    }
  };

  const handleDeleteCustomItem = (id: string) => {
    const item = customItems.find((c) => c.id === id);
    if (item) {
      setCustomToDelete({
        id,
        concept: item.concept,
        typeName: item.conceptType?.name ?? 'personalizado',
      });
      setDeleteCustomDialogOpen(true);
    }
  };

  const handleDeleteUnclassified = (id: string) => {
    const item = unclassifiedItems.find((u) => u.id === id);
    if (item) {
      setUnclassifiedToDelete({ id, concept: item.concept });
      setDeleteUnclassifiedDialogOpen(true);
    }
  };

  const handleMoveAsset = (id: string) => {
    const asset = assets.find((a) => a.id === id);
    if (asset) setMoveTarget({ id, concept: asset.concept, amount: asset.amount, kind: 'asset' });
  };

  const handleMoveIncome = (id: string) => {
    const income = incomes.find((i) => i.id === id);
    if (income) setMoveTarget({ id, concept: income.concept, amount: income.amount, kind: 'income' });
  };

  const handleMoveLiability = (id: string) => {
    const liability = liabilities.find((l) => l.id === id);
    if (liability) setMoveTarget({ id, concept: liability.concept, amount: liability.amount, kind: 'liability' });
  };

  const handleMoveCustomItem = (id: string) => {
    const item = customItems.find((c) => c.id === id);
    if (item) {
      setMoveTarget({
        id,
        concept: item.concept,
        amount: item.amount,
        kind: 'custom',
        customTypeId: item.conceptType?.id,
        customTypeName: item.conceptType?.name,
      });
    }
  };

  const handleMoveUnclassified = (id: string) => {
    const item = unclassifiedItems.find((u) => u.id === id);
    if (item) setMoveTarget({ id, concept: item.concept, amount: item.amount, kind: 'unclassified' });
  };

  const sumAmounts = (list: any[]) =>
    list.reduce((sum, item) => sum + toNumber(item.amount), 0);

  const totalAssets = sumAmounts(assets);
  const totalIncomes = sumAmounts(incomes);
  const totalLiabilities = sumAmounts(liabilities);
  const totalUnclassified = sumAmounts(unclassifiedItems);

  const customItemsByType = (conceptTypeId: string) =>
    customItems.filter((item) => item.conceptType?.id === conceptTypeId);
  const customTotalByType = (conceptTypeId: string) =>
    sumAmounts(customItemsByType(conceptTypeId));
  const customCountByType = (conceptTypeId: string) =>
    customItemsByType(conceptTypeId).length;

  return {
    declaration,
    client,
    loading,
    assets,
    incomes,
    liabilities,
    customItems,
    unclassifiedItems,
    conceptTypes,
    totalAssets,
    totalIncomes,
    totalLiabilities,
    totalUnclassified,
    customItemsByType,
    customTotalByType,
    customCountByType,
    observations,
    setObservations,
    deleteDeclarationDialogOpen,
    setDeleteDeclarationDialogOpen,
    isDeletingDeclaration,
    assetFormOpen,
    setAssetFormOpen,
    editingAsset,
    setEditingAsset,
    deleteAssetDialogOpen,
    setDeleteAssetDialogOpen,
    assetToDelete,
    setAssetToDelete,
    incomeFormOpen,
    setIncomeFormOpen,
    editingIncome,
    setEditingIncome,
    deleteIncomeDialogOpen,
    setDeleteIncomeDialogOpen,
    incomeToDelete,
    setIncomeToDelete,
    liabilityFormOpen,
    setLiabilityFormOpen,
    editingLiability,
    setEditingLiability,
    deleteLiabilityDialogOpen,
    setDeleteLiabilityDialogOpen,
    liabilityToDelete,
    setLiabilityToDelete,
    customFormOpen,
    setCustomFormOpen,
    customFormTypeId,
    setCustomFormTypeId,
    editingCustomItem,
    setEditingCustomItem,
    deleteCustomDialogOpen,
    setDeleteCustomDialogOpen,
    customToDelete,
    setCustomToDelete,
    deleteUnclassifiedDialogOpen,
    setDeleteUnclassifiedDialogOpen,
    unclassifiedToDelete,
    setUnclassifiedToDelete,
    moveTarget,
    setMoveTarget,
    typesManagerOpen,
    setTypesManagerOpen,
    handleFinalize,
    handleUpdateObservations,
    handleDeleteDeclaration,
    loadItems,
    loadTypes,
    refreshAfterMove,
    handleCreateAsset,
    handleEditAsset,
    handleDeleteAsset,
    handleCreateIncome,
    handleEditIncome,
    handleDeleteIncome,
    handleCreateLiability,
    handleEditLiability,
    handleDeleteLiability,
    handleCreateCustomItem,
    handleEditCustomItem,
    handleDeleteCustomItem,
    handleDeleteUnclassified,
    handleMoveAsset,
    handleMoveIncome,
    handleMoveLiability,
    handleMoveCustomItem,
    handleMoveUnclassified,
  };
}
