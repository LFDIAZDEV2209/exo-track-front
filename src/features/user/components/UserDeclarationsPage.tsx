'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  Calendar,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { declarationService } from '@/services';
import { useAuthStore } from '@/stores/auth-store';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import Link from 'next/link';
import { DeclarationStatus } from '@/types';
import { EmptyState } from '@/shared/layout/empty-state';

const ITEMS_PER_PAGE = 6;

export function UserDeclarationsPage() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDeclarations = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const response = await declarationService.findAllWithPagination(
          { limit: ITEMS_PER_PAGE, offset },
          user.id,
        );
        const limited = Array.isArray(response.declarations)
          ? response.declarations.slice(0, ITEMS_PER_PAGE)
          : [];
        setDeclarations(limited);
        setTotal(response.total);
        setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
      } catch (error) {
        console.error('Error loading declarations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeclarations();
  }, [user?.id, currentPage]);

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const filteredDeclarations = search.trim()
    ? declarations.filter(
        (d) =>
          String(d.taxableYear).includes(search) ||
          d.status.toLowerCase().includes(search.toLowerCase()),
      )
    : declarations;

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-down">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-sm font-bold shadow-sm">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mis Declaraciones</h1>
            <p className="text-sm text-muted-foreground">
              {total > 0
                ? `${total} declaracione${total !== 1 ? 's' : ''} registrada${total !== 1 ? 's' : ''}`
                : 'Lista de tus declaraciones de renta'}
            </p>
          </div>
        </div>
      </div>

      <div className="relative animate-fade-in-up stagger-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          placeholder="Buscar por año o estado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 bg-muted/30 border-border/50 focus-visible:bg-background"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : filteredDeclarations.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm animate-fade-in-up stagger-2">
          <EmptyState
            title={search.trim() ? 'Sin resultados' : 'Sin declaraciones'}
            description={
              search.trim()
                ? 'No se encontraron declaraciones con ese criterio'
                : 'Aún no tienes declaraciones registradas'
            }
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in-up stagger-2">
            {filteredDeclarations.map((declaration, index) => (
              <div
                key={declaration.id}
                className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-emerald-500/5 to-transparent" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <FileText className="h-5 w-5" />
                    </div>
                    <Badge
                      variant={
                        declaration.status === DeclarationStatus.COMPLETED
                          ? 'default'
                          : 'secondary'
                      }
                      className={
                        declaration.status === DeclarationStatus.PENDING
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                      }
                    >
                      {declaration.status === DeclarationStatus.COMPLETED
                        ? 'Finalizada'
                        : 'En Proceso'}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">Año {declaration.taxableYear}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(declaration.createdAt)}
                  </div>
                  <Link href={`/user/declarations/${declaration.id}`}>
                    <Button
                      variant="outline"
                      className="w-full transition-all duration-200 group-hover:border-emerald-500/30 group-hover:text-emerald-600"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalle
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {!search.trim() && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 animate-fade-in-up stagger-6">
              <span className="text-xs text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      (p >= currentPage - 1 && p <= currentPage + 1),
                  )
                  .map((page, idx, arr) => (
                    <span key={page} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="px-1 text-muted-foreground/40">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 min-w-8 ${
                          currentPage === page
                            ? 'bg-emerald-500 hover:bg-emerald-600'
                            : ''
                        }`}
                      >
                        {page}
                      </Button>
                    </span>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
