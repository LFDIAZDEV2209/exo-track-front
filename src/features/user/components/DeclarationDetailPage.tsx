'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { declarationService, incomeService, assetService, liabilityService } from '@/services';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/shared/components/data-table';

interface DeclarationDetailPageProps {
  declarationId: string;
}

const ITEMS_PER_PAGE = 10;

export function DeclarationDetailPage({ declarationId }: DeclarationDetailPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [declaration, setDeclaration] = useState<any>(null);
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

  // Cargar datos iniciales (declaración)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const decl = await declarationService.findOne(declarationId);
        setDeclaration(decl);
      } catch (error) {
        console.error('Error loading declaration:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [declarationId]);

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Declaración {declaration.taxableYear}
          </h1>
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
              </div>
            </CardHeader>
            <CardContent>
              <DataTable data={assets} readOnly />
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
              </div>
            </CardHeader>
            <CardContent>
              <DataTable data={incomes} readOnly />
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
              </div>
            </CardHeader>
            <CardContent>
              <DataTable data={liabilities} readOnly />
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

      {declaration.description && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones del Contador</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {declaration.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
