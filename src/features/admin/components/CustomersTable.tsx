'use client';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import Link from 'next/link';
import type { SortOrder, UserSortField } from '@/services';

const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota',
  });
};

interface CustomersTableProps {
  users: any[];
  searchQuery: string;
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  sortBy: UserSortField;
  order: SortOrder;
  onSortChange: (field: UserSortField) => void;
  onPageChange: (page: number) => void;
  onDeleteClick: (userId: string, userName: string) => void;
}

function SortableHeader({
  label,
  field,
  sortBy,
  order,
  onSortChange,
  className = '',
  align = 'left',
}: {
  label: string;
  field: UserSortField;
  sortBy: UserSortField;
  order: SortOrder;
  onSortChange: (field: UserSortField) => void;
  className?: string;
  align?: 'left' | 'center' | 'right';
}) {
  const isActive = sortBy === field;
  const Icon = isActive ? (order === 'ASC' ? ArrowUp : ArrowDown) : ArrowUpDown;
  const alignClass =
    align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start';

  return (
    <TableHead
      aria-sort={isActive ? (order === 'ASC' ? 'ascending' : 'descending') : 'none'}
      className={`text-xs font-bold uppercase tracking-wider text-muted-foreground ${className}`}
    >
      <button
        type="button"
        onClick={() => onSortChange(field)}
        aria-label={`Ordenar por ${label} ${isActive && order === 'ASC' ? 'descendente' : 'ascendente'}`}
        className={`inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-emerald-500 ${alignClass} ${
          isActive ? 'text-emerald-600' : ''
        }`}
      >
        {label}
        <Icon className={`h-3.5 w-3.5 ${isActive ? '' : 'opacity-40'}`} />
      </button>
    </TableHead>
  );
}

export function CustomersTable({
  users,
  searchQuery,
  loading,
  currentPage,
  totalPages,
  totalUsers,
  sortBy,
  order,
  onSortChange,
  onPageChange,
  onDeleteClick,
}: CustomersTableProps) {
  if (users.length === 0) {
    return null;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50">
              <SortableHeader
                label="Nombre"
                field="fullName"
                sortBy={sortBy}
                order={order}
                onSortChange={onSortChange}
              />
              <SortableHeader
                label="Cédula"
                field="documentNumber"
                sortBy={sortBy}
                order={order}
                onSortChange={onSortChange}
                className="hidden sm:table-cell"
              />
              <SortableHeader
                label="Email"
                field="email"
                sortBy={sortBy}
                order={order}
                onSortChange={onSortChange}
                className="hidden md:table-cell"
              />
              <SortableHeader
                label="Decl."
                field="totalDeclarations"
                sortBy={sortBy}
                order={order}
                onSortChange={onSortChange}
                align="center"
              />
              <SortableHeader
                label="Registro"
                field="createdAt"
                sortBy={sortBy}
                order={order}
                onSortChange={onSortChange}
                className="hidden lg:table-cell"
              />
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="transition-colors hover:bg-muted/30 border-b border-border/30"
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">
                      {user.fullName
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <span className="font-bold text-sm">{user.fullName}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm">
                  {user.documentNumber}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="default"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold"
                  >
                    {user.totalDeclarations || 0}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/customers/${user.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Ver ${user.fullName}`}
                        className="h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/customers/${user.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${user.fullName}`}
                        className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Eliminar ${user.fullName}`}
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDeleteClick(user.id, user.fullName)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-4">
          <span className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages}
            {searchQuery.trim() ? ` · ${totalUsers} resultado${totalUsers !== 1 ? 's' : ''}` : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
              aria-label="Página anterior"
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {(() => {
              const pages: number[] = [];
              for (let p = 1; p <= totalPages; p++) {
                if (
                  p === 1 ||
                  p === totalPages ||
                  (p >= currentPage - 1 && p <= currentPage + 1)
                ) {
                  pages.push(p);
                }
              }
              return pages.map((page, idx, arr) => (
                <span key={page} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="px-1 text-muted-foreground/40">...</span>
                  )}
                  <Button
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                    aria-label={`Página ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`h-8 min-w-8 ${
                      currentPage === page
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : ''
                    }`}
                  >
                    {page}
                  </Button>
                </span>
              ));
            })()}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || loading}
              aria-label="Página siguiente"
              className="h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
