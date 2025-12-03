'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { declarationService } from '@/services';
import { Badge } from '@/shared/ui/badge';
import Link from 'next/link';
import { DeclarationStatus } from '@/types';

interface DeclarationsPageProps {
  customerId: string;
}

const ITEMS_PER_PAGE = 9;

export function DeclarationsPage({ customerId }: DeclarationsPageProps) {
  const [loading, setLoading] = useState(true);
  const [declarations, setDeclarations] = useState<any[]>([]);
  
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDeclarations, setTotalDeclarations] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchDeclarations = async () => {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginationParams = {
          limit: ITEMS_PER_PAGE,
          offset,
        };
        
        const response = await declarationService.findAllWithPagination(
          paginationParams,
          customerId
        );
        
        // FORZAR límite a 9 registros siempre, sin importar lo que devuelva el backend
        const limitedDeclarations = Array.isArray(response.declarations) 
          ? response.declarations.slice(0, ITEMS_PER_PAGE)
          : [];
        
        // Asegurar que nunca haya más de 9
        if (limitedDeclarations.length > ITEMS_PER_PAGE) {
          limitedDeclarations.splice(ITEMS_PER_PAGE);
        }
        
        setDeclarations(limitedDeclarations);
        setTotalDeclarations(response.total);
        const calculatedPages = Math.ceil(response.total / ITEMS_PER_PAGE);
        setTotalPages(calculatedPages);
      } catch (error) {
        console.error('Error loading declarations:', error);
        setDeclarations([]);
        setTotalDeclarations(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDeclarations();
  }, [customerId, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Declaraciones</h1>
        <p className="text-muted-foreground">
          Declaraciones del cliente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Declaraciones</CardTitle>
          <p className="text-sm text-muted-foreground">
            {totalDeclarations} declaraciones registradas
            {totalPages > 1 && ` - Página ${currentPage} de ${totalPages}`}
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : declarations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay declaraciones para este cliente
            </p>
          ) : (
            <>
              <div className="space-y-4">
                {declarations.map((declaration) => (
                  <Link
                    key={declaration.id}
                    href={`/admin/customers/${customerId}/declarations/${declaration.id}`}
                    className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          Declaración {declaration.taxableYear}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {declaration.description || 'Sin descripción'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Creada: {new Date(declaration.createdAt).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <Badge
                        variant={declaration.status === DeclarationStatus.COMPLETED ? 'default' : 'secondary'}
                      >
                        {declaration.status === DeclarationStatus.COMPLETED ? 'Finalizada' : 'Pendiente'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Controles de paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalDeclarations)} de {totalDeclarations} declaraciones
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              disabled={loading}
                              className="min-w-[40px]"
                            >
                              {page}
                            </Button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-2 text-muted-foreground">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
