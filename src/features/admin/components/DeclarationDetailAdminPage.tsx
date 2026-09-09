'use client';

import { useCallback } from 'react';
import { Loader2, ArrowLeft, Trash2, Building2, TrendingUp, CreditCard, TriangleAlert, FileText, Shapes, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { assetService, incomeService, liabilityService, customItemService, unclassifiedItemService } from '@/services';
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
import { MoveItemDialog } from './MoveItemDialog';
import { ConceptTypesManagerDialog } from './ConceptTypesManagerDialog';
import { SubtypesManagerDialog } from './SubtypesManagerDialog';
import { FinancialDataTabPanel } from './FinancialDataTabPanel';
import { ObservationsCard } from './ObservationsCard';
import { DeclarationReportButtons } from '@/shared/components/declaration-report-buttons';
import { buildDeclarationReport } from '@/lib/declaration-report';
import { useAdminDeclaration } from '../hooks/useAdminDeclaration';

interface DeclarationDetailAdminPageProps {
  declarationId: string;
  customerId: string;
}

const toAmount = (amount: unknown): number =>
  typeof amount === 'string' ? parseFloat(amount) : (amount as number);

export function DeclarationDetailAdminPage({ declarationId, customerId }: DeclarationDetailAdminPageProps) {
  const router = useRouter();
  const ctx = useAdminDeclaration(declarationId, customerId);

  // Reporte completo: usa lo ya cargado y trae del servidor solo lo que falte.
  // Antes de los early returns: los hooks no pueden ser condicionales.
  const getReport = useCallback(async () => {
    const [assets, incomes, liabilities, customItems, unclassifiedItems] = await Promise.all([
      ctx.assets.length >= ctx.assetsTotal
        ? ctx.assets
        : assetService.findAllComplete(declarationId),
      ctx.incomes.length >= ctx.incomesTotal
        ? ctx.incomes
        : incomeService.findAllComplete(declarationId),
      ctx.liabilities.length >= ctx.liabilitiesTotal
        ? ctx.liabilities
        : liabilityService.findAllComplete(declarationId),
      ctx.customItems.length >= ctx.customItemsTotal
        ? ctx.customItems
        : customItemService.findAllComplete(declarationId),
      ctx.unclassifiedItems.length >= ctx.unclassifiedTotal
        ? ctx.unclassifiedItems
        : unclassifiedItemService.findAllComplete(declarationId),
    ]);
    return buildDeclarationReport({
      clientName: ctx.client?.fullName ?? '',
      documentNumber: ctx.client?.documentNumber ?? '',
      email: ctx.client?.email,
      phone: ctx.client?.phoneNumber,
      taxableYear: ctx.declaration.taxableYear,
      status: ctx.declaration.status === DeclarationStatus.COMPLETED ? 'Finalizada' : 'Pendiente',
      description: ctx.observations || ctx.declaration.description,
      assets,
      incomes,
      liabilities,
      customItems,
      customTypeNames: Object.fromEntries(ctx.conceptTypes.map((t) => [t.id, t.name])),
      unclassifiedItems,
    });
  }, [ctx, declarationId]);

  const reportReady = !ctx.loading && !!ctx.declaration;

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

  // Pestañas personalizadas: tipos activos + inactivos que aún tienen registros
  const visibleCustomTypes = ctx.conceptTypes.filter(
    (type) => type.isActive || ctx.customCountByType(type.id) > 0,
  );
  const customCounts: Record<string, number> = Object.fromEntries(
    ctx.conceptTypes.map((type) => [type.id, ctx.customCountByType(type.id)]),
  );

  const customFormType = ctx.customFormTypeId
    ? ctx.conceptTypes.find((t) => t.id === ctx.customFormTypeId)
    : null;

  const incomeSubtypes = ctx.subtypesByScope('income');
  const activeIncomeSubtypes = incomeSubtypes.filter((s) => s.isActive);
  const subtypeCounts = Object.fromEntries(
    incomeSubtypes.map((s) => [s.id, ctx.subtypeCountById(s.id, ctx.incomes)]),
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Volver">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/20">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight truncate">
            Declaración {ctx.declaration.taxableYear} - {ctx.client?.fullName || 'Cliente'}
          </h1>
          <p className="text-muted-foreground">
            Administra los datos de la declaración de renta
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <DeclarationReportButtons getReport={getReport} ready={reportReady} />
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
          <Button variant="outline" onClick={() => ctx.setTypesManagerOpen(true)}>
            <Settings2 className="mr-2 h-4 w-4" />
            Tipos
          </Button>
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
              {ctx.customCountByType(type.id) > 0 && (
                <span className="ml-1.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-bold">
                  {ctx.customCountByType(type.id)}
                </span>
              )}
            </TabsTrigger>
          ))}
          <TabsTrigger value="unclassified" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 font-bold">
            <TriangleAlert className="h-4 w-4 mr-2" /> Sin catalogar
            {ctx.unclassifiedItems.length > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[11px] font-bold text-white data-[state=active]:bg-white data-[state=active]:text-amber-600">
                {ctx.unclassifiedItems.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <FinancialDataTabPanel
            icon={<Building2 className="h-5 w-5 text-white" />}
            title="Patrimonios"
            totalFormatted={formatCurrency(ctx.totalAssets)}
            items={ctx.assets}
            onEdit={ctx.handleEditAsset}
            onDelete={ctx.handleDeleteAsset}
            onMove={ctx.handleMoveAsset}
            moveLabel="Mover a otro tipo"
            onAdd={ctx.handleCreateAsset}
          />
        </TabsContent>

        <TabsContent value="incomes" className="space-y-4">
          <FinancialDataTabPanel
            icon={<TrendingUp className="h-5 w-5 text-white" />}
            title="Ingresos"
            totalFormatted={formatCurrency(ctx.totalIncomes)}
            items={ctx.incomes}
            subtypes={incomeSubtypes}
            onManageSubtypes={() => ctx.setSubtypesManagerScope({ scope: 'income', label: 'ingresos' })}
            onEdit={ctx.handleEditIncome}
            onDelete={ctx.handleDeleteIncome}
            onMove={ctx.handleMoveIncome}
            moveLabel="Mover a otro tipo"
            onAdd={ctx.handleCreateIncome}
          />
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <FinancialDataTabPanel
            icon={<CreditCard className="h-5 w-5 text-white" />}
            title="Deudas"
            totalFormatted={formatCurrency(ctx.totalLiabilities)}
            items={ctx.liabilities}
            onEdit={ctx.handleEditLiability}
            onDelete={ctx.handleDeleteLiability}
            onMove={ctx.handleMoveLiability}
            moveLabel="Mover a otro tipo"
            onAdd={ctx.handleCreateLiability}
          />
        </TabsContent>

        {visibleCustomTypes.map((type) => (
          <TabsContent key={type.id} value={`custom-${type.id}`} className="space-y-4">
            <FinancialDataTabPanel
              icon={<Shapes className="h-5 w-5 text-white" />}
              title={type.name}
              totalFormatted={formatCurrency(ctx.customTotalByType(type.id))}
              items={ctx.customItemsByType(type.id)}
              onEdit={ctx.handleEditCustomItem}
              onDelete={ctx.handleDeleteCustomItem}
              onMove={ctx.handleMoveCustomItem}
              moveLabel="Mover a otro tipo"
              onAdd={() => ctx.handleCreateCustomItem(type.id)}
              emptyTitle={`Sin registros en ${type.name}`}
              emptyDescription="Agregue el primero con el botón Agregar."
            />
          </TabsContent>
        ))}

        <TabsContent value="unclassified" className="space-y-4">
          <FinancialDataTabPanel
            icon={<TriangleAlert className="h-5 w-5 text-white" />}
            title="Sin catalogar"
            totalFormatted={formatCurrency(ctx.totalUnclassified)}
            items={ctx.unclassifiedItems}
            onDelete={ctx.handleDeleteUnclassified}
            onMove={ctx.handleMoveUnclassified}
            moveLabel="Catalogar en…"
            headerClassName="bg-amber-500"
            emptyTitle="Nada pendiente"
            emptyDescription="Todos los conceptos exógenos están catalogados."
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
        onSuccess={() => ctx.loadItems()}
        itemType="asset"
        declarationId={declarationId}
        editingItem={ctx.editingAsset ? {
          id: ctx.editingAsset.id,
          concept: ctx.editingAsset.concept,
          amount: toAmount(ctx.editingAsset.amount),
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
          onDeleted={() => ctx.loadItems()}
          deleteService={assetService.remove}
        />
      )}

      <ItemFormDialog
        key={ctx.editingIncome ? `income-${ctx.editingIncome.id}` : 'income-new'}
        open={ctx.incomeFormOpen}
        onOpenChange={(open) => {
          ctx.setIncomeFormOpen(open);
          if (!open) ctx.setEditingIncome(null);
        }}
        onSuccess={() => ctx.loadItems()}
        itemType="income"
        subtypes={activeIncomeSubtypes}
        declarationId={declarationId}
        editingItem={ctx.editingIncome ? {
          id: ctx.editingIncome.id,
          concept: ctx.editingIncome.concept,
          amount: toAmount(ctx.editingIncome.amount),
          subtypeId: ctx.editingIncome.subtype?.id ?? null,
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
          onDeleted={() => ctx.loadItems()}
          deleteService={incomeService.remove}
        />
      )}

      <ItemFormDialog
        open={ctx.liabilityFormOpen}
        onOpenChange={(open) => {
          ctx.setLiabilityFormOpen(open);
          if (!open) ctx.setEditingLiability(null);
        }}
        onSuccess={() => ctx.loadItems()}
        itemType="liability"
        declarationId={declarationId}
        editingItem={ctx.editingLiability ? {
          id: ctx.editingLiability.id,
          concept: ctx.editingLiability.concept,
          amount: toAmount(ctx.editingLiability.amount),
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
          onDeleted={() => ctx.loadItems()}
          deleteService={liabilityService.remove}
        />
      )}

      <ItemFormDialog
        open={ctx.customFormOpen}
        onOpenChange={(open) => {
          ctx.setCustomFormOpen(open);
          if (!open) {
            ctx.setEditingCustomItem(null);
            ctx.setCustomFormTypeId(null);
          }
        }}
        onSuccess={() => ctx.loadItems()}
        itemType="custom"
        customTypeLabel={customFormType?.name}
        extraCreateFields={ctx.customFormTypeId ? { conceptTypeId: ctx.customFormTypeId } : undefined}
        declarationId={declarationId}
        editingItem={ctx.editingCustomItem ? {
          id: ctx.editingCustomItem.id,
          concept: ctx.editingCustomItem.concept,
          amount: toAmount(ctx.editingCustomItem.amount),
        } : null}
        createService={customItemService.create}
        updateService={customItemService.update}
      />

      {ctx.customToDelete && (
        <DeleteItemDialog
          open={ctx.deleteCustomDialogOpen}
          onOpenChange={(open) => {
            ctx.setDeleteCustomDialogOpen(open);
            if (!open) ctx.setCustomToDelete(null);
          }}
          itemId={ctx.customToDelete.id}
          itemConcept={ctx.customToDelete.concept}
          itemType="custom"
          customTypeLabel={ctx.customToDelete.typeName}
          onDeleted={() => ctx.loadItems()}
          deleteService={customItemService.remove}
        />
      )}

      {ctx.unclassifiedToDelete && (
        <DeleteItemDialog
          open={ctx.deleteUnclassifiedDialogOpen}
          onOpenChange={(open) => {
            ctx.setDeleteUnclassifiedDialogOpen(open);
            if (!open) ctx.setUnclassifiedToDelete(null);
          }}
          itemId={ctx.unclassifiedToDelete.id}
          itemConcept={ctx.unclassifiedToDelete.concept}
          itemType="unclassified"
          onDeleted={() => ctx.loadItems()}
          deleteService={unclassifiedItemService.remove}
        />
      )}

      <MoveItemDialog
        key={ctx.moveTarget?.id ?? 'move-closed'}
        open={ctx.moveTarget !== null}
        onOpenChange={(open) => {
          if (!open) ctx.setMoveTarget(null);
        }}
        declarationId={declarationId}
        item={ctx.moveTarget}
        conceptTypes={ctx.conceptTypes}
        subtypes={ctx.subtypes}
        onMoved={() => ctx.refreshAfterMove()}
      />

      <ConceptTypesManagerDialog
        key={ctx.typesManagerOpen ? 'types-open' : 'types-closed'}
        open={ctx.typesManagerOpen}
        onOpenChange={ctx.setTypesManagerOpen}
        types={ctx.conceptTypes}
        itemsCountByType={customCounts}
        onChanged={async () => {
          await Promise.all([ctx.loadTypes(), ctx.loadItems()]);
        }}
      />

      {ctx.subtypesManagerScope && (
        <SubtypesManagerDialog
          key={`subtypes-${ctx.subtypesManagerScope.scope}`}
          open={ctx.subtypesManagerScope !== null}
          onOpenChange={(open) => {
            if (!open) ctx.setSubtypesManagerScope(null);
          }}
          scope={ctx.subtypesManagerScope.scope}
          scopeLabel={ctx.subtypesManagerScope.label}
          types={incomeSubtypes}
          itemsCountBySubtype={subtypeCounts}
          onChanged={async () => {
            await Promise.all([ctx.loadSubtypes(), ctx.loadItems()]);
          }}
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
              <strong>{ctx.client?.fullName || 'el cliente'}</strong>, incluyendo todos los registros asociados.
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
