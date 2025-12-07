'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, Search, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import Link from 'next/link';
import { userService } from '@/services';
import { DeleteCustomerDialog } from './DeleteCustomerDialog';

const ITEMS_PER_PAGE = 10;

export function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);
  
  // Estado de paginación - ESTAS SON LAS VARIABLES QUE FALTABAN
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginationParams = {
          limit: ITEMS_PER_PAGE,
          offset,
        };
        
        // Debug: Ver qué parámetros se están enviando
        console.log('[CustomersPage] Fetching users with params:', paginationParams);
        
        const response = await userService.findAllWithPagination(paginationParams);
        
        // Debug: Ver qué respuesta se recibió
        console.log('[CustomersPage] Response received:', {
          usersCount: response.users.length,
          total: response.total,
          limit: response.limit,
          offset: response.offset,
        });
        
        setUsers(response.users);
        setTotalUsers(response.total);
        setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
        
        // Si hay búsqueda, filtrar los resultados
        if (searchQuery.trim()) {
          const filtered = response.users.filter((user) => {
            const query = searchQuery.toLowerCase();
            return (
              user.fullName.toLowerCase().includes(query) ||
              user.documentNumber.includes(query) ||
              user.email.toLowerCase().includes(query)
            );
          });
          setFilteredUsers(filtered);
        } else {
          setFilteredUsers(response.users);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  // Filtrar usuarios cuando cambia la búsqueda (solo en la página actual)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((user) => {
      const query = searchQuery.toLowerCase();
      return (
        user.fullName.toLowerCase().includes(query) ||
        user.documentNumber.includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });

    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setSelectedCustomer({ id: userId, name: userName });
    setDeleteDialogOpen(true);
  };

  const handleDeleted = () => {
    // Recargar la lista de usuarios después de eliminar
    const fetchUsers = async () => {
      try {
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const response = await userService.findAllWithPagination({
          limit: ITEMS_PER_PAGE,
          offset,
        });
        
        setUsers(response.users);
        setTotalUsers(response.total);
        setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
        
        if (searchQuery.trim()) {
          const filtered = response.users.filter((user) => {
            const query = searchQuery.toLowerCase();
            return (
              user.fullName.toLowerCase().includes(query) ||
              user.documentNumber.includes(query) ||
              user.email.toLowerCase().includes(query)
            );
          });
          setFilteredUsers(filtered);
        } else {
          setFilteredUsers(response.users);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    fetchUsers();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll al inicio de la tabla
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Administra la información de tus clientes
            </p>
          </div>
          <Link href="/admin/customers/new-customer">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <p className="text-sm text-muted-foreground">
              {totalUsers} clientes registrados
              {searchQuery.trim() && ` (${filteredUsers.length} en esta página)`}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cédula o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchQuery.trim() ? 'No se encontraron clientes con ese criterio' : 'No hay clientes registrados'}
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cédula</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Declaraciones</TableHead>
                      <TableHead>Fecha de Registro</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.documentNumber}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            {user.totalDeclarations || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/customers/${user.id}`}>
                              <Button variant="ghost" size="icon" title="Ver detalles">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/customers/${user.id}/edit`}>
                              <Button variant="ghost" size="icon" title="Editar">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              title="Eliminar"
                              onClick={() => handleDeleteClick(user.id, user.fullName)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Controles de paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalUsers)} de {totalUsers} clientes
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
                          // Mostrar solo algunas páginas alrededor de la actual
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
                                className="min-w-10"
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

      {/* Diálogo de confirmación de eliminación */}
      {selectedCustomer && (
        <DeleteCustomerDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              setSelectedCustomer(null);
            }
          }}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
