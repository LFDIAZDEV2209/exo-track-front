'use client';

import { type ReactNode } from 'react';
import { Card, CardContent, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { DataTable } from '@/shared/components/data-table';
import { PaginationControls } from '@/shared/components/pagination-controls';
import { Plus } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface FinancialDataTabPanelProps {
  icon: ReactNode;
  title: string;
  totalFormatted: string;
  data: any[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  readOnly?: boolean;
}

export function FinancialDataTabPanel({
  icon,
  title,
  totalFormatted,
  data,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onEdit,
  onDelete,
  onAdd,
  readOnly,
}: FinancialDataTabPanelProps) {
  return (
    <Card className="overflow-hidden border-t-4 border-t-emerald-600 pt-0 gap-0">
      <div className="bg-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="font-bold text-white">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white">Total: {totalFormatted}</span>
            {!readOnly && onAdd && (
              <Button onClick={onAdd} size="sm" className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold">
                <Plus className="mr-1 h-4 w-4" /> Agregar
              </Button>
            )}
          </div>
        </div>
      </div>
      <CardContent className="p-0">
        <DataTable
          data={data}
          onEdit={readOnly ? undefined : onEdit}
          onDelete={readOnly ? undefined : onDelete}
        />
        <div className={readOnly ? 'px-6 pb-4' : ''}>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            total={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={onPageChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
