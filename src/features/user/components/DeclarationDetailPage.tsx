'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { declarationService, incomeService, assetService, liabilityService } from '@/services';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/shared/ui/badge';

interface DeclarationDetailPageProps {
  declarationId: string;
}

export function DeclarationDetailPage({ declarationId }: DeclarationDetailPageProps) {
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
          declarationService.getById(declarationId),
          incomeService.getByDeclaration(declarationId),
          assetService.getByDeclaration(declarationId),
          liabilityService.getByDeclaration(declarationId),
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

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalAssets = assets.reduce((sum, ast) => sum + ast.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, liab) => sum + liab.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Detalle de Declaración</h1>
        <p className="text-muted-foreground">
          Información completa de la declaración
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información de la Declaración
            </CardTitle>
            <Badge variant={declaration.status === 'finalizada' ? 'default' : 'secondary'}>
              {declaration.status === 'finalizada' ? 'Finalizada' : 'Borrador'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Año Tributario</p>
            <p className="text-sm text-muted-foreground">{declaration.taxableYear}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Descripción</p>
            <p className="text-sm text-muted-foreground">
              {declaration.description || 'Sin descripción'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Fecha de Creación</p>
            <p className="text-sm text-muted-foreground">
              {new Date(declaration.createdAt).toLocaleDateString('es-CO')}
            </p>
          </div>
          {declaration.filePath && (
            <div className="flex gap-4 pt-4">
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {incomes.length} registro{incomes.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalAssets)}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {assets.length} registro{assets.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Pasivos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalLiabilities)}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {liabilities.length} registro{liabilities.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patrimonio Neto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(netWorth)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
