'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Card, CardContent, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { DataTable } from '@/shared/components/data-table';
import { PaginationControls } from '@/shared/components/pagination-controls';
import { EmptyState } from '@/shared/layout/empty-state';
import { Plus, Search, X } from 'lucide-react';
import { DataSource } from '@/types';

const ITEMS_PER_PAGE = 10;

type SourceFilter = 'all' | 'exogena' | 'manual';
type SortOption = 'recent' | 'concept-asc' | 'concept-desc' | 'amount-desc' | 'amount-asc';

const normalizeSource = (source: DataSource | string): 'exogena' | 'manual' => {
  if (typeof source === 'string') {
    const upper = source.toUpperCase();
    if (upper === 'EXOGENA' || upper === 'EXOGENO' || upper === 'EXOGENOUS') return 'exogena';
  } else if (source === DataSource.EXOGENO) {
    return 'exogena';
  }
  return 'manual';
};

const normalizeAmount = (amount: number | string): number => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Number.isFinite(num) ? num : 0;
};

interface FinancialDataTabPanelProps {
  icon: ReactNode;
  title: string;
  totalFormatted: string;
  /** Lista completa: el panel filtra, ordena y pagina en cliente (rápido, sin requests) */
  items: any[];
  onPageChange?: (page: number) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMove?: (id: string) => void;
  moveLabel?: string;
  onAdd?: () => void;
  addLabel?: string;
  readOnly?: boolean;
  headerClassName?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function FinancialDataTabPanel({
  icon,
  title,
  totalFormatted,
  items,
  onPageChange,
  onEdit,
  onDelete,
  onMove,
  moveLabel,
  onAdd,
  addLabel = 'Agregar',
  readOnly,
  headerClassName = 'bg-emerald-600',
  emptyTitle = 'Sin registros',
  emptyDescription = 'No hay registros en esta sección todavía',
}: FinancialDataTabPanelProps) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [sort, setSort] = useState<SortOption>('recent');
  const [page, setPage] = useState(1);

  const hasActiveFilters = search.trim() !== '' || sourceFilter !== 'all' || sort !== 'recent';

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = items;
    if (query) {
      result = result.filter((item) =>
        [item.concept, item.sourceDetail, item.reporterName, item.reporterNit]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(query)),
      );
    }
    if (sourceFilter !== 'all') {
      result = result.filter((item) => normalizeSource(item.source) === sourceFilter);
    }
    const sorted = [...result];
    switch (sort) {
      case 'concept-asc':
        sorted.sort((a, b) => String(a.concept).localeCompare(String(b.concept), 'es'));
        break;
      case 'concept-desc':
        sorted.sort((a, b) => String(b.concept).localeCompare(String(a.concept), 'es'));
        break;
      case 'amount-desc':
        sorted.sort((a, b) => normalizeAmount(b.amount) - normalizeAmount(a.amount));
        break;
      case 'amount-asc':
        sorted.sort((a, b) => normalizeAmount(a.amount) - normalizeAmount(b.amount));
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
        break;
    }
    return sorted;
  }, [items, search, sourceFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage);
  };

  const handleClear = () => {
    setSearch('');
    setSourceFilter('all');
    setSort('recent');
    setPage(1);
  };

  return (
    <Card className="overflow-hidden border-t-4 border-t-emerald-600 pt-0 gap-0">
      <div className={`${headerClassName} px-6 py-4`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {icon}
            <CardTitle className="font-bold text-white truncate">{title}</CardTitle>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
              {items.length}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-sm font-bold text-white hidden sm:inline">Total: {totalFormatted}</span>
            {!readOnly && onAdd && (
              <Button onClick={onAdd} size="sm" className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold">
                <Plus className="mr-1 h-4 w-4" /> {addLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
      <CardContent className="p-4 sm:p-6 space-y-4">
        {items.length > 0 && (
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Buscar en esta pestaña…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 bg-muted/30"
                aria-label={`Buscar en ${title}`}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={sourceFilter}
                onValueChange={(value) => {
                  setSourceFilter(value as SourceFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-32 bg-muted/30" aria-label="Filtrar por fuente">
                  <SelectValue placeholder="Fuente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Fuentes</SelectItem>
                  <SelectItem value="exogena">Exógeno</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sort}
                onValueChange={(value) => {
                  setSort(value as SortOption);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-40 bg-muted/30" aria-label="Ordenar registros">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recientes</SelectItem>
                  <SelectItem value="amount-desc">Mayor valor</SelectItem>
                  <SelectItem value="amount-asc">Menor valor</SelectItem>
                  <SelectItem value="concept-asc">Concepto A–Z</SelectItem>
                  <SelectItem value="concept-desc">Concepto Z–A</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  aria-label="Limpiar filtros de la pestaña"
                  className="h-9 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            description="Ningún registro coincide con los filtros. Ajusta la búsqueda."
            action={
              <Button size="sm" variant="outline" onClick={handleClear}>
                <X className="mr-1.5 h-3.5 w-3.5" />
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <>
            {hasActiveFilters && (
              <p className="text-xs text-muted-foreground" role="status">
                {filtered.length} de {items.length} registros
              </p>
            )}
            <DataTable
              data={pageItems}
              onEdit={readOnly ? undefined : onEdit}
              onDelete={readOnly ? undefined : onDelete}
              onMove={readOnly ? undefined : onMove}
              moveLabel={moveLabel}
            />
            <PaginationControls
              currentPage={safePage}
              totalPages={totalPages}
              total={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
