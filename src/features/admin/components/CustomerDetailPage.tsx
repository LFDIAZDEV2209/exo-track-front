'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { FileText, Loader2, ArrowLeft, Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { userService, declarationService } from '@/services';
import { Badge } from '@/shared/ui/badge';
import { useRouter } from 'next/navigation';
import { DeclarationStatus } from '@/types';

interface CustomerDetailPageProps {
  customerId: string;
}

const ITEMS_PER_PAGE = 6;

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [declarations, setDeclarations] = useState<any[]>([]);
  
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDeclarations, setTotalDeclarations] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        
        const [clientData, declarationsResponse] = await Promise.all([
          userService.findOne(customerId),
          declarationService.findAllWithPagination(
            {
              limit: ITEMS_PER_PAGE,
              offset,
            },
            customerId
          ),
        ]);

        // FORZAR límite a 9 registros siempre
        const limitedDeclarations = Array.isArray(declarationsResponse.declarations) 
          ? declarationsResponse.declarations.slice(0, ITEMS_PER_PAGE)
          : [];
        
        if (limitedDeclarations.length > ITEMS_PER_PAGE) {
          limitedDeclarations.splice(ITEMS_PER_PAGE);
        }

        setClient({
          ...clientData,
          totalDeclarations: declarationsResponse.total,
        });
        setDeclarations(limitedDeclarations);
        setTotalDeclarations(declarationsResponse.total);
        const calculatedPages = Math.ceil(declarationsResponse.total / ITEMS_PER_PAGE);
        setTotalPages(calculatedPages);
      } catch (error) {
        console.error('Error loading customer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Cliente no encontrado</p>
      </div>
    );
  }

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/customers')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Declaraciones de {client.fullName}
          </h1>
          <p className="text-muted-foreground">
            Administra las declaraciones de renta del cliente
          </p>
        </div>
        <Link href={`/admin/customers/${customerId}/declarations/new-declaration`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Declaración
          </Button>
        </Link>
      </div>

      {declarations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No hay declaraciones para este cliente
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {declarations.map((declaration) => (
              <Card key={declaration.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
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
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Año {declaration.taxableYear}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    {formatDate(declaration.createdAt)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {declaration.description || 'Sin descripción'}
                  </p>
                  <Link href={`/admin/customers/${customerId}/declarations/${declaration.id}`}>
                    <Button variant="outline" className="w-full">
                      Ver Detalle
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
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
    </div>
  );
}
