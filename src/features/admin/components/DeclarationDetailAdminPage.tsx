'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Textarea } from '@/shared/ui/textarea';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { declarationService, incomeService, assetService, liabilityService, userService } from '@/services';
import { formatCurrency } from '@/lib/utils';
import { DataTable } from '@/shared/components/data-table';
import { useToast } from '@/hooks/use-toast';
import { DeclarationStatus } from '@/types';

interface DeclarationDetailAdminPageProps {
  declarationId: string;
  customerId: string;
}

export function DeclarationDetailAdminPage({ declarationId, customerId }: DeclarationDetailAdminPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [declaration, setDeclaration] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [observations, setObservations] = useState(declaration?.description || '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [decl, clientData, incs, asts, liabs] = await Promise.all([
          declarationService.findOne(declarationId),
          userService.findOne(customerId),
          incomeService.findAll(undefined, declarationId),
          assetService.findAll(undefined, declarationId),
          liabilityService.findAll(undefined, declarationId),
        ]);

        setDeclaration(decl);
        setClient(clientData);
        setIncomes(incs);
        setAssets(asts);
        setLiabilities(liabs);
        setObservations(decl?.description || '');
      } catch (error) {
        console.error('Error loading declaration:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [declarationId, customerId]);

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
      toast({
        title: 'Error',
        description: error.message || 'Error al finalizar la declaración',
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
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar observaciones',
        variant: 'destructive',
      });
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={assets}
                onEdit={(id) => {
                  // TODO: Implementar edición
                  console.log('Edit asset:', id);
                }}
                onDelete={(id) => {
                  // TODO: Implementar eliminación
                  console.log('Delete asset:', id);
                }}
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={incomes}
                onEdit={(id) => {
                  // TODO: Implementar edición
                  console.log('Edit income:', id);
                }}
                onDelete={(id) => {
                  // TODO: Implementar eliminación
                  console.log('Delete income:', id);
                }}
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={liabilities}
                onEdit={(id) => {
                  // TODO: Implementar edición
                  console.log('Edit liability:', id);
                }}
                onDelete={(id) => {
                  // TODO: Implementar eliminación
                  console.log('Delete liability:', id);
                }}
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
    </div>
  );
}

