'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { declarationService, incomeService, assetService, liabilityService } from '@/services';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/shared/components/data-table';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [decl, incs, asts, liabs] = await Promise.all([
          declarationService.findOne(declarationId),
          incomeService.findAll(undefined, declarationId),
          assetService.findAll(undefined, declarationId),
          liabilityService.findAll(undefined, declarationId),
        ]);

        setDeclaration(decl);
        setIncomes(incs);
        setAssets(asts);
        setLiabilities(liabs);
      } catch (error) {
        console.error('Error loading declaration:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [declarationId]);

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

  const totalAssets = assets.reduce((sum, ast) => sum + ast.amount, 0);
  const totalIncomes = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, liab) => sum + liab.amount, 0);

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
