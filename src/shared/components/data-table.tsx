'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { formatCurrency } from '@/lib/utils';
import { DataSource } from '@/types';

interface DataTableItem {
  id: string;
  concept: string;
  amount: number | string;
  source: DataSource | string;
}

interface DataTableProps {
  data: DataTableItem[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

export function DataTable({ data, onEdit, onDelete, readOnly = false }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay registros
      </div>
    );
  }

  // Normalizar el source (el backend puede devolver "MANUAL" o "EXOGENO" en mayúsculas)
  const normalizeSource = (source: DataSource | string): DataSource => {
    if (typeof source === 'string') {
      const upperSource = source.toUpperCase();
      if (upperSource === 'EXOGENO' || upperSource === 'EXOGENOUS') {
        return DataSource.EXOGENO;
      }
      return DataSource.MANUAL;
    }
    return source;
  };

  // Normalizar el amount (puede venir como string)
  const normalizeAmount = (amount: number | string): number => {
    if (typeof amount === 'string') {
      return parseFloat(amount);
    }
    return amount;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Concepto</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Fuente</TableHead>
          {!readOnly && <TableHead>Acciones</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => {
          const source = normalizeSource(item.source);
          const amount = normalizeAmount(item.amount);
          
          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.concept}</TableCell>
              <TableCell>{formatCurrency(amount)}</TableCell>
              <TableCell>
                <Badge variant={source === DataSource.EXOGENO ? 'default' : 'secondary'}>
                  {source === DataSource.EXOGENO ? 'Exógeno' : 'Manual'}
                </Badge>
              </TableCell>
              {!readOnly && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

