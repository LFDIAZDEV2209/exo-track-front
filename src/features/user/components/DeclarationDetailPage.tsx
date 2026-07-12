'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Building2, TrendingUp, CreditCard, MessageSquare } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { declarationService, incomeService, assetService, liabilityService } from '@/services';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { FinancialDataTabPanel } from '@/features/admin/components/FinancialDataTabPanel';

interface DeclarationDetailPageProps {
  declarationId: string;
}

export function DeclarationDetailPage({ declarationId }: DeclarationDetailPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [declaration, setDeclaration] = useState<any>(null);
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

  const fetchAssets = useCallback(async (page: number) => {
    try {
      const offset = (page - 1) * 10;
      const response = await assetService.findAllWithPagination({ limit: 10, offset }, declarationId);
      const limitedAssets = Array.isArray(response.assets) ? response.assets.slice(0, 10) : [];
      setAssets(limitedAssets);
      setAssetsTotal(response.total);
      setAssetsTotalPages(Math.ceil(response.total / 10));
      if (page === 1 && response.total > 0) {
        const allAssetsResponse = await assetService.findAllWithPagination({ limit: response.total, offset: 0 }, declarationId);
        setAllAssets(allAssetsResponse.assets);
      } else if (page === 1) {
        setAllAssets([]);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  }, [declarationId]);

  const fetchIncomes = useCallback(async (page: number) => {
    try {
      const offset = (page - 1) * 10;
      const response = await incomeService.findAllWithPagination({ limit: 10, offset }, declarationId);
      const limitedIncomes = Array.isArray(response.incomes) ? response.incomes.slice(0, 10) : [];
      setIncomes(limitedIncomes);
      setIncomesTotal(response.total);
      setIncomesTotalPages(Math.ceil(response.total / 10));
      if (page === 1 && response.total > 0) {
        const allIncomesResponse = await incomeService.findAllWithPagination({ limit: response.total, offset: 0 }, declarationId);
        setAllIncomes(allIncomesResponse.incomes);
      } else if (page === 1) {
        setAllIncomes([]);
      }
    } catch (error) {
      console.error('Error loading incomes:', error);
    }
  }, [declarationId]);

  const fetchLiabilities = useCallback(async (page: number) => {
    try {
      const offset = (page - 1) * 10;
      const response = await liabilityService.findAllWithPagination({ limit: 10, offset }, declarationId);
      const limitedLiabilities = Array.isArray(response.liabilities) ? response.liabilities.slice(0, 10) : [];
      setLiabilities(limitedLiabilities);
      setLiabilitiesTotal(response.total);
      setLiabilitiesTotalPages(Math.ceil(response.total / 10));
      if (page === 1 && response.total > 0) {
        const allLiabilitiesResponse = await liabilityService.findAllWithPagination({ limit: response.total, offset: 0 }, declarationId);
        setAllLiabilities(allLiabilitiesResponse.liabilities);
      } else if (page === 1) {
        setAllLiabilities([]);
      }
    } catch (error) {
      console.error('Error loading liabilities:', error);
    }
  }, [declarationId]);

  const handleAssetsPageChange = (newPage: number) => {
    setAssetsPage(newPage);
    fetchAssets(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIncomesPageChange = (newPage: number) => {
    setIncomesPage(newPage);
    fetchIncomes(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLiabilitiesPageChange = (newPage: number) => {
    setLiabilitiesPage(newPage);
    fetchLiabilities(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const decl = await declarationService.findOne(declarationId);
        setDeclaration(decl);
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
  }, [declarationId, fetchAssets, fetchIncomes, fetchLiabilities]);

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full" />
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Declaración {declaration.taxableYear}</h1>
          <p className="text-muted-foreground">Revisa los datos de tu declaración de renta</p>
        </div>
      </div>

      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="assets" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 font-bold">
            <Building2 className="h-4 w-4 mr-2" /> Patrimonios
          </TabsTrigger>
          <TabsTrigger value="incomes" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 font-bold">
            <TrendingUp className="h-4 w-4 mr-2" /> Ingresos
          </TabsTrigger>
          <TabsTrigger value="liabilities" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 font-bold">
            <CreditCard className="h-4 w-4 mr-2" /> Deudas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <FinancialDataTabPanel
            icon={<Building2 className="h-5 w-5 text-white" />}
            title="Patrimonios"
            totalFormatted={formatCurrency(totalAssets)}
            data={assets}
            currentPage={assetsPage}
            totalPages={assetsTotalPages}
            totalItems={assetsTotal}
            onPageChange={handleAssetsPageChange}
            readOnly
          />
        </TabsContent>

        <TabsContent value="incomes" className="space-y-4">
          <FinancialDataTabPanel
            icon={<TrendingUp className="h-5 w-5 text-white" />}
            title="Ingresos"
            totalFormatted={formatCurrency(totalIncomes)}
            data={incomes}
            currentPage={incomesPage}
            totalPages={incomesTotalPages}
            totalItems={incomesTotal}
            onPageChange={handleIncomesPageChange}
            readOnly
          />
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <FinancialDataTabPanel
            icon={<CreditCard className="h-5 w-5 text-white" />}
            title="Deudas"
            totalFormatted={formatCurrency(totalLiabilities)}
            data={liabilities}
            currentPage={liabilitiesPage}
            totalPages={liabilitiesTotalPages}
            totalItems={liabilitiesTotal}
            onPageChange={handleLiabilitiesPageChange}
            readOnly
          />
        </TabsContent>
      </Tabs>

      {declaration.description && (
        <Card className="overflow-hidden border-t-4 border-t-emerald-600 pt-0 gap-0">
          <div className="bg-emerald-600 px-6 py-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-white" />
              <CardTitle className="font-bold text-white">Observaciones del Contador</CardTitle>
            </div>
          </div>
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap px-6 py-4">
              {declaration.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
