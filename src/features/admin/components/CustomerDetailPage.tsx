'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { ArrowLeft, Loader2, Calendar, Plus, ChevronLeft, ChevronRight, FileText, FilePlus, Eye, User } from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/customers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="w-1 h-8 bg-emerald-600 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
              <User className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Declaraciones de {client.fullName}</h1>
              <p className="text-sm text-muted-foreground">Administra las declaraciones de renta del cliente</p>
            </div>
          </div>
        </div>
        <Link href={`/admin/customers/${customerId}/declarations/new-declaration`}>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all duration-200 hover:shadow-md">
            <FilePlus className="mr-2 h-4 w-4" /> Nueva Declaración
          </Button>
        </Link>
      </div>

      {declarations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No hay declaraciones para este cliente</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {declarations.map((declaration, index) => (
              <Link href={`/admin/customers/${customerId}/declarations/${declaration.id}`} key={declaration.id}>
                <Card className="relative overflow-hidden border-l-4 border-l-emerald-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="bg-emerald-600 px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{declaration.taxableYear}</h3>
                      </div>
                      <Badge
                        variant={declaration.status === DeclarationStatus.COMPLETED ? 'default' : 'secondary'}
                        className={declaration.status === DeclarationStatus.PENDING ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 font-bold' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-bold'}
                      >
                        {declaration.status === DeclarationStatus.COMPLETED ? 'Finalizada' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium">{formatDate(declaration.createdAt)}</span>
                    </div>
                    {declaration.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{declaration.description}</p>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <Button variant="outline" size="sm" className="w-full border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50">
                        <Eye className="mr-1 h-4 w-4" /> Ver Detalle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

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
                          className={currentPage === page ? "min-w-10 bg-emerald-500 text-white hover:bg-emerald-600" : "min-w-10"}
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
