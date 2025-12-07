'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Textarea } from '@/shared/ui/textarea';
import { ArrowLeft, Plus, Loader2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { declarationService, incomeService, assetService, liabilityService, userService } from '@/services';
import { formatCurrency } from '@/lib/utils';
import { DataTable } from '@/shared/components/data-table';
import { useToast } from '@/hooks/use-toast';
import { DeclarationStatus, DataSource } from '@/types';
import { ItemFormDialog } from './ItemFormDialog';
import { DeleteItemDialog } from './DeleteItemDialog';
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

interface DeclarationDetailAdminPageProps {
  declarationId: string;
  customerId: string;
}

const ITEMS_PER_PAGE = 10;

export function DeclarationDetailAdminPage({ declarationId, customerId }: DeclarationDetailAdminPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [declaration, setDeclaration] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  
  // Estados para cada tipo de dato con paginación
  const [incomes, setIncomes] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  
  // Estados de paginación para cada tab
  const [assetsPage, setAssetsPage] = useState(1);
  const [assetsTotal, setAssetsTotal] = useState(0);
  const [assetsTotalPages, setAssetsTotalPages] = useState(0);
  
  const [incomesPage, setIncomesPage] = useState(1);
  const [incomesTotal, setIncomesTotal] = useState(0);
  const [incomesTotalPages, setIncomesTotalPages] = useState(0);
  
  const [liabilitiesPage, setLiabilitiesPage] = useState(1);
  const [liabilitiesTotal, setLiabilitiesTotal] = useState(0);
  const [liabilitiesTotalPages, setLiabilitiesTotalPages] = useState(0);
  
  // Totales para cálculo (necesitamos todos los registros para calcular el total)
  const [allAssets, setAllAssets] = useState<any[]>([]);
  const [allIncomes, setAllIncomes] = useState<any[]>([]);
  const [allLiabilities, setAllLiabilities] = useState<any[]>([]);
  
  const [observations, setObservations] = useState('');
  const [deleteDeclarationDialogOpen, setDeleteDeclarationDialogOpen] = useState(false);
  const [isDeletingDeclaration, setIsDeletingDeclaration] = useState(false);

  // Estados para diálogos de assets
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [deleteAssetDialogOpen, setDeleteAssetDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<{ id: string; concept: string } | null>(null);

  // Estados para diálogos de incomes
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any | null>(null);
  const [deleteIncomeDialogOpen, setDeleteIncomeDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<{ id: string; concept: string } | null>(null);

  // Estados para diálogos de liabilities
  const [liabilityFormOpen, setLiabilityFormOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState<any | null>(null);
  const [deleteLiabilityDialogOpen, setDeleteLiabilityDialogOpen] = useState(false);
  const [liabilityToDelete, setLiabilityToDelete] = useState<{ id: string; concept: string } | null>(null);

  // Cargar datos iniciales (declaración y cliente)
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
      } catch (error) {
        console.error('Error loading declaration:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [declarationId, customerId]);

  // Cargar assets con paginación
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const offset = (assetsPage - 1) * ITEMS_PER_PAGE;
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
        
        // Si es la primera página, guardar todos para calcular totales
        if (assetsPage === 1 && response.total > 0) {
          // Cargar todos los assets para calcular el total
          const allAssetsResponse = await assetService.findAllWithPagination(
            { limit: response.total, offset: 0 },
            declarationId
          );
          setAllAssets(allAssetsResponse.assets);
        } else if (assetsPage === 1) {
          setAllAssets([]);
        }
      } catch (error) {
        console.error('Error loading assets:', error);
      }
    };

    if (declarationId) {
      fetchAssets();
    }
  }, [declarationId, assetsPage]);

  // Cargar incomes con paginación
  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        const offset = (incomesPage - 1) * ITEMS_PER_PAGE;
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
        
        // Si es la primera página, guardar todos para calcular totales
        if (incomesPage === 1 && response.total > 0) {
          const allIncomesResponse = await incomeService.findAllWithPagination(
            { limit: response.total, offset: 0 },
            declarationId
          );
          setAllIncomes(allIncomesResponse.incomes);
        } else if (incomesPage === 1) {
          setAllIncomes([]);
        }
      } catch (error) {
        console.error('Error loading incomes:', error);
      }
    };

    if (declarationId) {
      fetchIncomes();
    }
  }, [declarationId, incomesPage]);

  // Cargar liabilities con paginación
  useEffect(() => {
    const fetchLiabilities = async () => {
      try {
        const offset = (liabilitiesPage - 1) * ITEMS_PER_PAGE;
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
        
        // Si es la primera página, guardar todos para calcular totales
        if (liabilitiesPage === 1 && response.total > 0) {
          const allLiabilitiesResponse = await liabilityService.findAllWithPagination(
            { limit: response.total, offset: 0 },
            declarationId
          );
          setAllLiabilities(allLiabilitiesResponse.liabilities);
        } else if (liabilitiesPage === 1) {
          setAllLiabilities([]);
        }
      } catch (error) {
        console.error('Error loading liabilities:', error);
      }
    };

    if (declarationId) {
      fetchLiabilities();
    }
  }, [declarationId, liabilitiesPage]);

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

  // Funciones para cambiar de página
  const handleAssetsPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= assetsTotalPages) {
      setAssetsPage(newPage);
    }
  };

  const handleIncomesPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= incomesTotalPages) {
      setIncomesPage(newPage);
    }
  };

  const handleLiabilitiesPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= liabilitiesTotalPages) {
      setLiabilitiesPage(newPage);
    }
  };

  // Funciones para recargar datos después de crear/editar/eliminar
  const reloadAssets = async (resetToFirstPage: boolean = false) => {
    try {
      // Si se creó un nuevo item, volver a la primera página
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
      
      // Si la página actual quedó vacía después de eliminar, volver a la última página disponible
      if (!resetToFirstPage && newTotalPages > 0 && currentPage > newTotalPages) {
        setAssetsPage(newTotalPages);
        // Recargar con la nueva página
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
      
      // Recargar todos los assets para calcular totales
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
      // Si se creó un nuevo item, volver a la primera página
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
      
      // Si la página actual quedó vacía después de eliminar, volver a la última página disponible
      if (!resetToFirstPage && newTotalPages > 0 && currentPage > newTotalPages) {
        setIncomesPage(newTotalPages);
        // Recargar con la nueva página
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
      
      // Recargar todos los incomes para calcular totales
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
      // Si se creó un nuevo item, volver a la primera página
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
      
      // Si la página actual quedó vacía después de eliminar, volver a la última página disponible
      if (!resetToFirstPage && newTotalPages > 0 && currentPage > newTotalPages) {
        setLiabilitiesPage(newTotalPages);
        // Recargar con la nueva página
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
      
      // Recargar todos los liabilities para calcular totales
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

  // Handlers para assets
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

  // Handlers para incomes
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

  // Handlers para liabilities
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!declaration) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Declaración no encontrada</p>
      </div>
    );
  }

  // Calcular totales usando todos los registros (no solo los de la página actual)
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

  // Componente de paginación reutilizable
  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    total, 
    onPageChange 
  }: { 
    currentPage: number; 
    totalPages: number; 
    total: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between pt-4 border-t mt-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, total)} de {total} registros
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="min-w-10"
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 text-muted-foreground">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Declaración {declaration.taxableYear} - {client?.fullName || 'Cliente'}
          </h1>
          <p className="text-muted-foreground">
            Administra los datos de la declaración de renta
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={declaration.status === DeclarationStatus.COMPLETED ? 'default' : 'secondary'}
            className={
              declaration.status === DeclarationStatus.PENDING
                ? 'bg-orange-100 text-orange-800'
                : 'bg-green-100 text-green-800'
            }
          >
            {declaration.status === DeclarationStatus.COMPLETED ? 'Finalizada' : 'Pendiente'}
          </Badge>
          {declaration.status === DeclarationStatus.PENDING && (
            <Button onClick={handleFinalize}>
              Finalizar Declaración
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => setDeleteDeclarationDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar Declaración
          </Button>
        </div>
      </div>

      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Patrimonios</TabsTrigger>
          <TabsTrigger value="incomes">Ingresos</TabsTrigger>
          <TabsTrigger value="liabilities">Deudas</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Patrimonios</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total: {formatCurrency(totalAssets)}
                  </p>
                </div>
                <Button onClick={handleCreateAsset}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={assets}
                onEdit={handleEditAsset}
                onDelete={handleDeleteAsset}
              />
              <PaginationControls
                currentPage={assetsPage}
                totalPages={assetsTotalPages}
                total={assetsTotal}
                onPageChange={handleAssetsPageChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incomes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ingresos</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total: {formatCurrency(totalIncomes)}
                  </p>
                </div>
                <Button onClick={handleCreateIncome}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={incomes}
                onEdit={handleEditIncome}
                onDelete={handleDeleteIncome}
              />
              <PaginationControls
                currentPage={incomesPage}
                totalPages={incomesTotalPages}
                total={incomesTotal}
                onPageChange={handleIncomesPageChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Deudas</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total: {formatCurrency(totalLiabilities)}
                  </p>
                </div>
                <Button onClick={handleCreateLiability}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={liabilities}
                onEdit={handleEditLiability}
                onDelete={handleDeleteLiability}
              />
              <PaginationControls
                currentPage={liabilitiesPage}
                totalPages={liabilitiesTotalPages}
                total={liabilitiesTotal}
                onPageChange={handleLiabilitiesPageChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Observaciones del Contador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Notas y comentarios"
            rows={4}
          />
          <Button onClick={handleUpdateObservations}>
            Guardar Observaciones
          </Button>
        </CardContent>
      </Card>

      {/* Diálogos para Assets */}
      <ItemFormDialog
        open={assetFormOpen}
        onOpenChange={(open) => {
          setAssetFormOpen(open);
          if (!open) {
            setEditingAsset(null);
          }
        }}
        onSuccess={(wasCreated) => reloadAssets(wasCreated)}
        itemType="asset"
        declarationId={declarationId}
        editingItem={editingAsset ? {
          id: editingAsset.id,
          concept: editingAsset.concept,
          amount: typeof editingAsset.amount === 'string' ? parseFloat(editingAsset.amount) : editingAsset.amount,
        } : null}
        createService={assetService.create}
        updateService={assetService.update}
      />

      {assetToDelete && (
        <DeleteItemDialog
          open={deleteAssetDialogOpen}
          onOpenChange={(open) => {
            setDeleteAssetDialogOpen(open);
            if (!open) {
              setAssetToDelete(null);
            }
          }}
          itemId={assetToDelete.id}
          itemConcept={assetToDelete.concept}
          itemType="asset"
          onDeleted={reloadAssets}
          deleteService={assetService.remove}
        />
      )}

      {/* Diálogos para Incomes */}
      <ItemFormDialog
        open={incomeFormOpen}
        onOpenChange={(open) => {
          setIncomeFormOpen(open);
          if (!open) {
            setEditingIncome(null);
          }
        }}
        onSuccess={(wasCreated) => reloadIncomes(wasCreated)}
        itemType="income"
        declarationId={declarationId}
        editingItem={editingIncome ? {
          id: editingIncome.id,
          concept: editingIncome.concept,
          amount: typeof editingIncome.amount === 'string' ? parseFloat(editingIncome.amount) : editingIncome.amount,
        } : null}
        createService={incomeService.create}
        updateService={incomeService.update}
      />

      {incomeToDelete && (
        <DeleteItemDialog
          open={deleteIncomeDialogOpen}
          onOpenChange={(open) => {
            setDeleteIncomeDialogOpen(open);
            if (!open) {
              setIncomeToDelete(null);
            }
          }}
          itemId={incomeToDelete.id}
          itemConcept={incomeToDelete.concept}
          itemType="income"
          onDeleted={reloadIncomes}
          deleteService={incomeService.remove}
        />
      )}

      {/* Diálogos para Liabilities */}
      <ItemFormDialog
        open={liabilityFormOpen}
        onOpenChange={(open) => {
          setLiabilityFormOpen(open);
          if (!open) {
            setEditingLiability(null);
          }
        }}
        onSuccess={(wasCreated) => reloadLiabilities(wasCreated)}
        itemType="liability"
        declarationId={declarationId}
        editingItem={editingLiability ? {
          id: editingLiability.id,
          concept: editingLiability.concept,
          amount: typeof editingLiability.amount === 'string' ? parseFloat(editingLiability.amount) : editingLiability.amount,
        } : null}
        createService={liabilityService.create}
        updateService={liabilityService.update}
      />

      {liabilityToDelete && (
        <DeleteItemDialog
          open={deleteLiabilityDialogOpen}
          onOpenChange={(open) => {
            setDeleteLiabilityDialogOpen(open);
            if (!open) {
              setLiabilityToDelete(null);
            }
          }}
          itemId={liabilityToDelete.id}
          itemConcept={liabilityToDelete.concept}
          itemType="liability"
          onDeleted={reloadLiabilities}
          deleteService={liabilityService.remove}
        />
      )}

      {/* Diálogo de confirmación para eliminar declaración */}
      <AlertDialog open={deleteDeclarationDialogOpen} onOpenChange={setDeleteDeclarationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la declaración del año{' '}
              <strong>{declaration.taxableYear}</strong> para el cliente{' '}
              <strong>{client?.fullName || 'el cliente'}</strong>, incluyendo todos los patrimonios, ingresos y deudas asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingDeclaration}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDeclaration}
              disabled={isDeletingDeclaration}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingDeclaration ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

