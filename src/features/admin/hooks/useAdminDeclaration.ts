'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { declarationService, incomeService, assetService, liabilityService, userService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { DeclarationStatus } from '@/types';

const ITEMS_PER_PAGE = 10;

export function useAdminDeclaration(declarationId: string, customerId: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [declaration, setDeclaration] = useState<any>(null);
  const [client, setClient] = useState<any>(null);

  const [incomes, setIncomes] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);

  const [assetsPage, setAssetsPage] = useState(1);
  const [assetsTotal, setAssetsTotal] = useState(0);
  const [assetsTotalPages, setAssetsTotalPages] = useState(0);

  const [incomesPage, setIncomesPage] = useState(1);
  const [incomesTotal, setIncomesTotal] = useState(0);
  const [incomesTotalPages, setIncomesTotalPages] = useState(0);

  const [liabilitiesPage, setLiabilitiesPage] = useState(1);
  const [liabilitiesTotal, setLiabilitiesTotal] = useState(0);
  const [liabilitiesTotalPages, setLiabilitiesTotalPages] = useState(0);

  const [allAssets, setAllAssets] = useState<any[]>([]);
  const [allIncomes, setAllIncomes] = useState<any[]>([]);
  const [allLiabilities, setAllLiabilities] = useState<any[]>([]);

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

  const fetchAssets = useCallback(async (page: number) => {
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const response = await assetService.findAllWithPagination(
        { limit: ITEMS_PER_PAGE, offset },
        declarationId
      );

      const limitedAssets = Array.isArray(response.assets)
        ? response.assets.slice(0, ITEMS_PER_PAGE)
        : [];

      setAssets(limitedAssets);
      setAssetsTotal(response.total);
      setAssetsTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));

      if (page === 1 && response.total > 0) {
        const allAssetsResponse = await assetService.findAllWithPagination(
          { limit: response.total, offset: 0 },
          declarationId
        );
        setAllAssets(allAssetsResponse.assets);
      } else if (page === 1) {
        setAllAssets([]);
      }
      setAssetsPage(page);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  }, [declarationId]);

  const fetchIncomes = useCallback(async (page: number) => {
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const response = await incomeService.findAllWithPagination(
        { limit: ITEMS_PER_PAGE, offset },
        declarationId
      );

      const limitedIncomes = Array.isArray(response.incomes)
        ? response.incomes.slice(0, ITEMS_PER_PAGE)
        : [];

      setIncomes(limitedIncomes);
      setIncomesTotal(response.total);
      setIncomesTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));

      if (page === 1 && response.total > 0) {
        const allIncomesResponse = await incomeService.findAllWithPagination(
          { limit: response.total, offset: 0 },
          declarationId
        );
        setAllIncomes(allIncomesResponse.incomes);
      } else if (page === 1) {
        setAllIncomes([]);
      }
      setIncomesPage(page);
    } catch (error) {
      console.error('Error loading incomes:', error);
    }
  }, [declarationId]);

  const fetchLiabilities = useCallback(async (page: number) => {
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const response = await liabilityService.findAllWithPagination(
        { limit: ITEMS_PER_PAGE, offset },
        declarationId
      );

      const limitedLiabilities = Array.isArray(response.liabilities)
        ? response.liabilities.slice(0, ITEMS_PER_PAGE)
        : [];

      setLiabilities(limitedLiabilities);
      setLiabilitiesTotal(response.total);
      setLiabilitiesTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));

      if (page === 1 && response.total > 0) {
        const allLiabilitiesResponse = await liabilityService.findAllWithPagination(
          { limit: response.total, offset: 0 },
          declarationId
        );
        setAllLiabilities(allLiabilitiesResponse.liabilities);
      } else if (page === 1) {
        setAllLiabilities([]);
      }
      setLiabilitiesPage(page);
    } catch (error) {
      console.error('Error loading liabilities:', error);
    }
  }, [declarationId]);

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

        fetchAssets(1);
        fetchIncomes(1);
        fetchLiabilities(1);
      } catch (error) {
        console.error('Error loading declaration:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [declarationId, customerId, fetchAssets, fetchIncomes, fetchLiabilities]);

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

  const handleAssetsPageChange = (newPage: number) => {
    fetchAssets(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIncomesPageChange = (newPage: number) => {
    fetchIncomes(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLiabilitiesPageChange = (newPage: number) => {
    fetchLiabilities(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reloadAssets = async (resetToFirstPage: boolean = false) => {
    try {
      if (resetToFirstPage) {
        setAssetsPage(1);
      }

      const currentPage = resetToFirstPage ? 1 : assetsPage;
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;

      const response = await assetService.findAllWithPagination(
        { limit: ITEMS_PER_PAGE, offset },
        declarationId
      );

      const limitedAssets = Array.isArray(response.assets)
        ? response.assets.slice(0, ITEMS_PER_PAGE)
        : [];

      setAssets(limitedAssets);
      setAssetsTotal(response.total);
      const newTotalPages = Math.ceil(response.total / ITEMS_PER_PAGE);
      setAssetsTotalPages(newTotalPages);

      if (!resetToFirstPage && newTotalPages > 0 && currentPage > newTotalPages) {
        setAssetsPage(newTotalPages);
        const newOffset = (newTotalPages - 1) * ITEMS_PER_PAGE;
        const newResponse = await assetService.findAllWithPagination(
          { limit: ITEMS_PER_PAGE, offset: newOffset },
          declarationId
        );
        const newLimitedAssets = Array.isArray(newResponse.assets)
          ? newResponse.assets.slice(0, ITEMS_PER_PAGE)
          : [];
        setAssets(newLimitedAssets);
      }

      if (response.total > 0) {
        const allAssetsResponse = await assetService.findAllWithPagination(
          { limit: response.total, offset: 0 },
          declarationId
        );
        setAllAssets(allAssetsResponse.assets);
      } else {
        setAllAssets([]);
      }
    } catch (error) {
      console.error('Error reloading assets:', error);
    }
  };

  const reloadIncomes = async (resetToFirstPage: boolean = false) => {
    try {
      if (resetToFirstPage) {
        setIncomesPage(1);
      }

      const currentPage = resetToFirstPage ? 1 : incomesPage;
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const response = await incomeService.findAllWithPagination(
        { limit: ITEMS_PER_PAGE, offset },
        declarationId
      );

      const limitedIncomes = Array.isArray(response.incomes)
        ? response.incomes.slice(0, ITEMS_PER_PAGE)
        : [];

      setIncomes(limitedIncomes);
      setIncomesTotal(response.total);
      const newTotalPages = Math.ceil(response.total / ITEMS_PER_PAGE);
      setIncomesTotalPages(newTotalPages);

      if (!resetToFirstPage && newTotalPages > 0 && currentPage > newTotalPages) {
        setIncomesPage(newTotalPages);
        const newOffset = (newTotalPages - 1) * ITEMS_PER_PAGE;
        const newResponse = await incomeService.findAllWithPagination(
          { limit: ITEMS_PER_PAGE, offset: newOffset },
          declarationId
        );
        const newLimitedIncomes = Array.isArray(newResponse.incomes)
          ? newResponse.incomes.slice(0, ITEMS_PER_PAGE)
          : [];
        setIncomes(newLimitedIncomes);
      }

      if (response.total > 0) {
        const allIncomesResponse = await incomeService.findAllWithPagination(
          { limit: response.total, offset: 0 },
          declarationId
        );
        setAllIncomes(allIncomesResponse.incomes);
      } else {
        setAllIncomes([]);
      }
    } catch (error) {
      console.error('Error reloading incomes:', error);
    }
  };

  const reloadLiabilities = async (resetToFirstPage: boolean = false) => {
    try {
      if (resetToFirstPage) {
        setLiabilitiesPage(1);
      }

      const currentPage = resetToFirstPage ? 1 : liabilitiesPage;
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const response = await liabilityService.findAllWithPagination(
        { limit: ITEMS_PER_PAGE, offset },
        declarationId
      );

      const limitedLiabilities = Array.isArray(response.liabilities)
        ? response.liabilities.slice(0, ITEMS_PER_PAGE)
        : [];

      setLiabilities(limitedLiabilities);
      setLiabilitiesTotal(response.total);
      const newTotalPages = Math.ceil(response.total / ITEMS_PER_PAGE);
      setLiabilitiesTotalPages(newTotalPages);

      if (!resetToFirstPage && newTotalPages > 0 && currentPage > newTotalPages) {
        setLiabilitiesPage(newTotalPages);
        const newOffset = (newTotalPages - 1) * ITEMS_PER_PAGE;
        const newResponse = await liabilityService.findAllWithPagination(
          { limit: ITEMS_PER_PAGE, offset: newOffset },
          declarationId
        );
        const newLimitedLiabilities = Array.isArray(newResponse.liabilities)
          ? newResponse.liabilities.slice(0, ITEMS_PER_PAGE)
          : [];
        setLiabilities(newLimitedLiabilities);
      }

      if (response.total > 0) {
        const allLiabilitiesResponse = await liabilityService.findAllWithPagination(
          { limit: response.total, offset: 0 },
          declarationId
        );
        setAllLiabilities(allLiabilitiesResponse.liabilities);
      } else {
        setAllLiabilities([]);
      }
    } catch (error) {
      console.error('Error reloading liabilities:', error);
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

  const totalAssets = allAssets.reduce((sum, ast) => {
    const amount = typeof ast.amount === 'string' ? parseFloat(ast.amount) : ast.amount;
    return sum + (amount || 0);
  }, 0);

  const totalIncomes = allIncomes.reduce((sum, inc) => {
    const amount = typeof inc.amount === 'string' ? parseFloat(inc.amount) : inc.amount;
    return sum + (amount || 0);
  }, 0);

  const totalLiabilities = allLiabilities.reduce((sum, liab) => {
    const amount = typeof liab.amount === 'string' ? parseFloat(liab.amount) : liab.amount;
    return sum + (amount || 0);
  }, 0);

  return {
    declaration,
    client,
    loading,
    assets,
    incomes,
    liabilities,
    assetsPage,
    assetsTotal,
    assetsTotalPages,
    incomesPage,
    incomesTotal,
    incomesTotalPages,
    liabilitiesPage,
    liabilitiesTotal,
    liabilitiesTotalPages,
    totalAssets,
    totalIncomes,
    totalLiabilities,
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
    handleFinalize,
    handleUpdateObservations,
    handleDeleteDeclaration,
    handleAssetsPageChange,
    handleIncomesPageChange,
    handleLiabilitiesPageChange,
    reloadAssets,
    reloadIncomes,
    reloadLiabilities,
    handleCreateAsset,
    handleEditAsset,
    handleDeleteAsset,
    handleCreateIncome,
    handleEditIncome,
    handleDeleteIncome,
    handleCreateLiability,
    handleEditLiability,
    handleDeleteLiability,
  };
}
