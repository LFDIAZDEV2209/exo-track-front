'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Loader2, Search, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userService } from '@/services';
import { DeleteCustomerDialog } from './DeleteCustomerDialog';

const ITEMS_PER_PAGE = 10;

export function CustomersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]); // Para búsqueda global
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);
  
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Ref para rastrear si estamos cargando todos los usuarios (evita dependencias circulares)
  const isLoadingAllUsersRef = useRef(false);

  // Función para cargar todos los usuarios (para búsqueda global)
  const fetchAllUsers = useCallback(async () => {
    // Evitar cargar múltiples veces simultáneamente
    if (isLoadingAllUsersRef.current) {
      return [];
    }
    
    try {
      isLoadingAllUsersRef.current = true;
      setSearching(true);
      const allUsersList: any[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await userService.findAllWithPagination({
          limit: ITEMS_PER_PAGE,
          offset,
        });
        
        allUsersList.push(...response.users);
        
        if (response.users.length < ITEMS_PER_PAGE || allUsersList.length >= response.total) {
          hasMore = false;
        } else {
          offset += ITEMS_PER_PAGE;
        }
      }

      setAllUsers(allUsersList);
      return allUsersList;
    } catch (error) {
      console.error('Error loading all users:', error);
      return [];
    } finally {
      setSearching(false);
      isLoadingAllUsersRef.current = false;
    }
  }, []); // Sin dependencias para evitar recreaciones innecesarias

  // Función para cargar usuarios de la página actual
  const fetchUsers = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const paginationParams = {
        limit: ITEMS_PER_PAGE,
        offset,
      };
      
      const response = await userService.findAllWithPagination(paginationParams);
      
      setUsers(response.users);
      setTotalUsers(response.total);
      setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Cargar usuarios cuando cambia la página (solo si no hay búsqueda activa)
  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchUsers(currentPage);
    }
  }, [currentPage, searchQuery, fetchUsers]);

  // Actualizar filteredUsers cuando cambian los users (solo si no hay búsqueda activa)
  useEffect(() => {
    if (!searchQuery.trim() && users.length > 0) {
      setFilteredUsers(users);
    }
  }, [users, searchQuery]);

  // Limpiar allUsers cuando no hay búsqueda (separado para evitar ciclos)
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Limpiar allUsers cuando no hay búsqueda para liberar memoria
      // No verificamos allUsers.length para evitar dependencias circulares
      setAllUsers([]);
    }
  }, [searchQuery]); // Solo cuando cambia searchQuery

  // Búsqueda global cuando hay un término de búsqueda
  useEffect(() => {
    // Solo procesar si hay un término de búsqueda
    const query = searchQuery.trim();
    if (!query) {
      return;
    }

    // Función auxiliar para filtrar usuarios
    const filterUsers = (usersList: any[]) => {
      const lowerQuery = query.toLowerCase();
      return usersList.filter((user) => {
        return (
          user.fullName.toLowerCase().includes(lowerQuery) ||
          user.documentNumber.includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery)
        );
      });
    };
    
    // Si ya tenemos todos los usuarios cargados, buscar en ellos
    if (allUsers.length > 0) {
      const filtered = filterUsers(allUsers);
      setFilteredUsers(filtered);
    } else if (!isLoadingAllUsersRef.current) {
      // Si no, cargar todos los usuarios primero (solo si no estamos ya cargando)
      fetchAllUsers().then((allUsersList) => {
        // Verificar que searchQuery no haya cambiado mientras cargábamos
        // Leer el valor actual de searchQuery del estado
        setAllUsers(allUsersList);
        // Filtrar después de actualizar allUsers
        // Nota: esto podría usar un valor obsoleto de searchQuery, pero
        // si searchQuery cambió, este efecto se ejecutará de nuevo
        const filtered = filterUsers(allUsersList);
        setFilteredUsers(filtered);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // Solo dependemos de searchQuery

  // Recargar datos cuando se vuelve a la página (después de crear un cliente)
  useEffect(() => {
    // Verificar si se acaba de crear un cliente (solo al montar el componente)
    const customerCreated = sessionStorage.getItem('customerCreated');
    if (customerCreated === 'true') {
      sessionStorage.removeItem('customerCreated');
      // Esperar un momento para que se carguen los datos iniciales, luego recargar
      setTimeout(() => {
        const currentQuery = searchQuery.trim();
        if (!currentQuery) {
          fetchUsers(1);
          setCurrentPage(1);
        } else {
          // Si hay búsqueda, recargar todos los usuarios
          fetchAllUsers().then((allUsersList) => {
            const filtered = allUsersList.filter((user) => {
              const query = currentQuery.toLowerCase();
              return (
                user.fullName.toLowerCase().includes(query) ||
                user.documentNumber.includes(query) ||
                user.email.toLowerCase().includes(query)
              );
            });
            setFilteredUsers(filtered);
          });
        }
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar al montar el componente

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

  const handleDeleted = async () => {
    // Recargar la lista de usuarios después de eliminar
    if (searchQuery.trim()) {
      // Si hay búsqueda, recargar todos los usuarios
      const allUsersList = await fetchAllUsers();
      const filtered = allUsersList.filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
          user.fullName.toLowerCase().includes(query) ||
          user.documentNumber.includes(query) ||
          user.email.toLowerCase().includes(query)
        );
      });
      setFilteredUsers(filtered);
    } else {
      // Si no hay búsqueda, recargar solo la página actual
      await fetchUsers(currentPage);
    }
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
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
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
              {searchQuery.trim() 
                ? `${filteredUsers.length} cliente${filteredUsers.length !== 1 ? 's' : ''} encontrado${filteredUsers.length !== 1 ? 's' : ''} de ${totalUsers} registrados`
                : `${totalUsers} cliente${totalUsers !== 1 ? 's' : ''} registrado${totalUsers !== 1 ? 's' : ''}`}
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
                disabled={loading || searching}
              />
            </div>

            {(loading || searching) ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  {searching ? 'Buscando en todos los clientes...' : 'Cargando...'}
                </span>
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
                    {filteredUsers.map((user, index) => (
                      <TableRow 
                        key={user.id}
                        className="animate-in fade-in slide-in-from-left-4 transition-colors duration-150 hover:bg-accent/50"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
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
                              <Button variant="ghost" size="icon" title="Ver detalles" className="transition-transform duration-150 hover:scale-110">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/customers/${user.id}/edit`}>
                              <Button variant="ghost" size="icon" title="Editar" className="transition-transform duration-150 hover:scale-110">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive transition-transform duration-150 hover:scale-110"
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

                {/* Controles de paginación - Solo mostrar cuando NO hay búsqueda activa */}
                {!searchQuery.trim() && totalPages > 1 && (
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
