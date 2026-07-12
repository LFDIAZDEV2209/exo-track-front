'use client';

import { Loader2, ArrowLeft, Trash2, Building2, TrendingUp, CreditCard, TriangleAlert, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { assetService, incomeService, liabilityService } from '@/services';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
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
import { formatCurrency } from '@/lib/utils';
import { DeclarationStatus } from '@/types';
import { ItemFormDialog } from './ItemFormDialog';
import { DeleteItemDialog } from './DeleteItemDialog';
import { FinancialDataTabPanel } from './FinancialDataTabPanel';
import { ObservationsCard } from './ObservationsCard';
import { useAdminDeclaration } from '../hooks/useAdminDeclaration';

interface DeclarationDetailAdminPageProps {
  declarationId: string;
  customerId: string;
}

export function DeclarationDetailAdminPage({ declarationId, customerId }: DeclarationDetailAdminPageProps) {
  const router = useRouter();
  const ctx = useAdminDeclaration(declarationId, customerId);

  if (ctx.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ctx.declaration) {
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/20">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Declaración {ctx.declaration.taxableYear} - {ctx.client?.fullName || 'Cliente'}
          </h1>
          <p className="text-muted-foreground">
            Administra los datos de la declaración de renta
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={ctx.declaration.status === DeclarationStatus.COMPLETED ? 'default' : 'secondary'}
            className={
              ctx.declaration.status === DeclarationStatus.PENDING
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }
          >
            {ctx.declaration.status === DeclarationStatus.COMPLETED ? 'Finalizada' : 'Pendiente'}
          </Badge>
          {ctx.declaration.status === DeclarationStatus.PENDING && (
            <Button onClick={ctx.handleFinalize}>
              Finalizar Declaración
            </Button>
          )}
          <Button variant="destructive" onClick={() => ctx.setDeleteDeclarationDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar Declaración
          </Button>
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
            totalFormatted={formatCurrency(ctx.totalAssets)}
            data={ctx.assets}
            currentPage={ctx.assetsPage}
            totalPages={ctx.assetsTotalPages}
            totalItems={ctx.assetsTotal}
            onPageChange={ctx.handleAssetsPageChange}
            onEdit={ctx.handleEditAsset}
            onDelete={ctx.handleDeleteAsset}
            onAdd={ctx.handleCreateAsset}
          />
        </TabsContent>

        <TabsContent value="incomes" className="space-y-4">
          <FinancialDataTabPanel
            icon={<TrendingUp className="h-5 w-5 text-white" />}
            title="Ingresos"
            totalFormatted={formatCurrency(ctx.totalIncomes)}
            data={ctx.incomes}
            currentPage={ctx.incomesPage}
            totalPages={ctx.incomesTotalPages}
            totalItems={ctx.incomesTotal}
            onPageChange={ctx.handleIncomesPageChange}
            onEdit={ctx.handleEditIncome}
            onDelete={ctx.handleDeleteIncome}
            onAdd={ctx.handleCreateIncome}
          />
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <FinancialDataTabPanel
            icon={<CreditCard className="h-5 w-5 text-white" />}
            title="Deudas"
            totalFormatted={formatCurrency(ctx.totalLiabilities)}
            data={ctx.liabilities}
            currentPage={ctx.liabilitiesPage}
            totalPages={ctx.liabilitiesTotalPages}
            totalItems={ctx.liabilitiesTotal}
            onPageChange={ctx.handleLiabilitiesPageChange}
            onEdit={ctx.handleEditLiability}
            onDelete={ctx.handleDeleteLiability}
            onAdd={ctx.handleCreateLiability}
          />
        </TabsContent>
      </Tabs>

      <ObservationsCard
        value={ctx.observations}
        onChange={ctx.setObservations}
        onSave={ctx.handleUpdateObservations}
      />

      <ItemFormDialog
        open={ctx.assetFormOpen}
        onOpenChange={(open) => {
          ctx.setAssetFormOpen(open);
          if (!open) ctx.setEditingAsset(null);
        }}
        onSuccess={(wasCreated) => ctx.reloadAssets(wasCreated)}
        itemType="asset"
        declarationId={declarationId}
        editingItem={ctx.editingAsset ? {
          id: ctx.editingAsset.id,
          concept: ctx.editingAsset.concept,
          amount: typeof ctx.editingAsset.amount === 'string' ? parseFloat(ctx.editingAsset.amount) : ctx.editingAsset.amount,
        } : null}
        createService={assetService.create}
        updateService={assetService.update}
      />

      {ctx.assetToDelete && (
        <DeleteItemDialog
          open={ctx.deleteAssetDialogOpen}
          onOpenChange={(open) => {
            ctx.setDeleteAssetDialogOpen(open);
            if (!open) ctx.setAssetToDelete(null);
          }}
          itemId={ctx.assetToDelete.id}
          itemConcept={ctx.assetToDelete.concept}
          itemType="asset"
          onDeleted={ctx.reloadAssets}
          deleteService={assetService.remove}
        />
      )}

      <ItemFormDialog
        open={ctx.incomeFormOpen}
        onOpenChange={(open) => {
          ctx.setIncomeFormOpen(open);
          if (!open) ctx.setEditingIncome(null);
        }}
        onSuccess={(wasCreated) => ctx.reloadIncomes(wasCreated)}
        itemType="income"
        declarationId={declarationId}
        editingItem={ctx.editingIncome ? {
          id: ctx.editingIncome.id,
          concept: ctx.editingIncome.concept,
          amount: typeof ctx.editingIncome.amount === 'string' ? parseFloat(ctx.editingIncome.amount) : ctx.editingIncome.amount,
        } : null}
        createService={incomeService.create}
        updateService={incomeService.update}
      />

      {ctx.incomeToDelete && (
        <DeleteItemDialog
          open={ctx.deleteIncomeDialogOpen}
          onOpenChange={(open) => {
            ctx.setDeleteIncomeDialogOpen(open);
            if (!open) ctx.setIncomeToDelete(null);
          }}
          itemId={ctx.incomeToDelete.id}
          itemConcept={ctx.incomeToDelete.concept}
          itemType="income"
          onDeleted={ctx.reloadIncomes}
          deleteService={incomeService.remove}
        />
      )}

      <ItemFormDialog
        open={ctx.liabilityFormOpen}
        onOpenChange={(open) => {
          ctx.setLiabilityFormOpen(open);
          if (!open) ctx.setEditingLiability(null);
        }}
        onSuccess={(wasCreated) => ctx.reloadLiabilities(wasCreated)}
        itemType="liability"
        declarationId={declarationId}
        editingItem={ctx.editingLiability ? {
          id: ctx.editingLiability.id,
          concept: ctx.editingLiability.concept,
          amount: typeof ctx.editingLiability.amount === 'string' ? parseFloat(ctx.editingLiability.amount) : ctx.editingLiability.amount,
        } : null}
        createService={liabilityService.create}
        updateService={liabilityService.update}
      />

      {ctx.liabilityToDelete && (
        <DeleteItemDialog
          open={ctx.deleteLiabilityDialogOpen}
          onOpenChange={(open) => {
            ctx.setDeleteLiabilityDialogOpen(open);
            if (!open) ctx.setLiabilityToDelete(null);
          }}
          itemId={ctx.liabilityToDelete.id}
          itemConcept={ctx.liabilityToDelete.concept}
          itemType="liability"
          onDeleted={ctx.reloadLiabilities}
          deleteService={liabilityService.remove}
        />
      )}

      <AlertDialog open={ctx.deleteDeclarationDialogOpen} onOpenChange={ctx.setDeleteDeclarationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-destructive" />
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la declaración del año{' '}
              <strong>{ctx.declaration.taxableYear}</strong> para el cliente{' '}
              <strong>{ctx.client?.fullName || 'el cliente'}</strong>, incluyendo todos los patrimonios, ingresos y deudas asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={ctx.isDeletingDeclaration}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={ctx.handleDeleteDeclaration}
              disabled={ctx.isDeletingDeclaration}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {ctx.isDeletingDeclaration ? (
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
