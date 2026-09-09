'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Building2, TrendingUp, CreditCard, MessageSquare, Shapes } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { declarationService, incomeService, assetService, liabilityService, conceptTypeService, customItemService, unclassifiedItemService } from '@/services';
import type { ConceptType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { FinancialDataTabPanel } from '@/features/admin/components/FinancialDataTabPanel';
import { DeclarationReportButtons } from '@/shared/components/declaration-report-buttons';
import { buildDeclarationReport } from '@/lib/declaration-report';
import { useAuthStore } from '@/stores/auth-store';

interface DeclarationDetailPageProps {
  declarationId: string;
}

const FULL_LIST_LIMIT = 1000;

const toNumber = (value: unknown): number => {
  const num = typeof value === 'string' ? parseFloat(value) : (value as number);
  return Number.isFinite(num) ? num : 0;
};

export function DeclarationDetailPage({ declarationId }: DeclarationDetailPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [declaration, setDeclaration] = useState<any>(null);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [unclassifiedItems, setUnclassifiedItems] = useState<any[]>([]);
  const [conceptTypes, setConceptTypes] = useState<ConceptType[]>([]);
  const loggedUser = useAuthStore((s) => s.user);

  const loadData = useCallback(async () => {
    const [decl, assetsRes, incomesRes, liabilitiesRes, customRes, unclassifiedRes, types] = await Promise.all([
      declarationService.findOne(declarationId),
      assetService.findAllWithPagination({ limit: FULL_LIST_LIMIT, offset: 0 }, declarationId),
      incomeService.findAllWithPagination({ limit: FULL_LIST_LIMIT, offset: 0 }, declarationId),
      liabilityService.findAllWithPagination({ limit: FULL_LIST_LIMIT, offset: 0 }, declarationId),
      customItemService.findAllWithPagination({ limit: FULL_LIST_LIMIT, offset: 0 }, declarationId),
      // Solo para el reporte completo (la pestaña sigue siendo solo admin)
      unclassifiedItemService.findAllWithPagination({ limit: FULL_LIST_LIMIT, offset: 0 }, declarationId),
      conceptTypeService.findAll(),
    ]);
    setDeclaration(decl);
    setAssets(assetsRes.assets);
    setIncomes(incomesRes.incomes);
    setLiabilities(liabilitiesRes.liabilities);
    setCustomItems(customRes.items);
    setUnclassifiedItems(unclassifiedRes.items);
    setConceptTypes(types);
  }, [declarationId]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await loadData();
      } catch (error) {
        console.error('Error loading declaration:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [loadData]);

  const sumAmounts = (list: any[]) => list.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const totalAssets = sumAmounts(assets);
  const totalIncomes = sumAmounts(incomes);
  const totalLiabilities = sumAmounts(liabilities);

  // El usuario solo ve tipos con registros en su declaración (sin importar si están activos)
  const visibleCustomTypes = conceptTypes.filter((type) =>
    customItems.some((item) => item.conceptType?.id === type.id),
  );
  const customItemsByType = (conceptTypeId: string) =>
    customItems.filter((item) => item.conceptType?.id === conceptTypeId);

  const report = useMemo(
    () =>
      loading || !declaration
        ? null
        : buildDeclarationReport({
            clientName: loggedUser?.fullName ?? '',
            documentNumber: loggedUser?.documentNumber ?? '',
            email: loggedUser?.email,
            phone: loggedUser?.phoneNumber,
            taxableYear: declaration.taxableYear,
            status: declaration.status === 'COMPLETED' ? 'Finalizada' : 'Pendiente',
            description: declaration.description,
            assets,
            incomes,
            liabilities,
            customItems,
            customTypeNames: Object.fromEntries(conceptTypes.map((t) => [t.id, t.name])),
            unclassifiedItems,
          }),
    [loading, declaration, loggedUser, assets, incomes, liabilities, customItems, unclassifiedItems, conceptTypes],
  );

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
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Volver">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full" />
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Declaración {declaration.taxableYear}</h1>
          <p className="text-muted-foreground">Revisa los datos de tu declaración de renta</p>
        </div>
        <DeclarationReportButtons report={report} />
      </div>

      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-xl flex-wrap h-auto">
          <TabsTrigger value="assets" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 font-bold">
            <Building2 className="h-4 w-4 mr-2" /> Patrimonios
          </TabsTrigger>
          <TabsTrigger value="incomes" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 font-bold">
            <TrendingUp className="h-4 w-4 mr-2" /> Ingresos
          </TabsTrigger>
          <TabsTrigger value="liabilities" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 font-bold">
            <CreditCard className="h-4 w-4 mr-2" /> Deudas
          </TabsTrigger>
          {visibleCustomTypes.map((type) => (
            <TabsTrigger
              key={type.id}
              value={`custom-${type.id}`}
              className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 font-bold"
            >
              <Shapes className="h-4 w-4 mr-2" /> {type.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <FinancialDataTabPanel
            icon={<Building2 className="h-5 w-5 text-white" />}
            title="Patrimonios"
            totalFormatted={formatCurrency(totalAssets)}
            items={assets}
            readOnly
          />
        </TabsContent>

        <TabsContent value="incomes" className="space-y-4">
          <FinancialDataTabPanel
            icon={<TrendingUp className="h-5 w-5 text-white" />}
            title="Ingresos"
            totalFormatted={formatCurrency(totalIncomes)}
            items={incomes}
            readOnly
          />
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <FinancialDataTabPanel
            icon={<CreditCard className="h-5 w-5 text-white" />}
            title="Deudas"
            totalFormatted={formatCurrency(totalLiabilities)}
            items={liabilities}
            readOnly
          />
        </TabsContent>

        {visibleCustomTypes.map((type) => {
          const typeItems = customItemsByType(type.id);
          return (
            <TabsContent key={type.id} value={`custom-${type.id}`} className="space-y-4">
              <FinancialDataTabPanel
                icon={<Shapes className="h-5 w-5 text-white" />}
                title={type.name}
                totalFormatted={formatCurrency(sumAmounts(typeItems))}
                items={typeItems}
                readOnly
              />
            </TabsContent>
          );
        })}
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
