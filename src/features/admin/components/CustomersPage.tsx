'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Plus,
  Loader2,
  Search,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import Link from 'next/link';
import { userService } from '@/services';
import { DeleteCustomerDialog } from './DeleteCustomerDialog';
import { EmptyState } from '@/shared/layout/empty-state';

const ITEMS_PER_PAGE = 10;

export function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const isLoadingAllUsersRef = useRef(false);

  const fetchAllUsers = useCallback(async () => {
    if (isLoadingAllUsersRef.current) return [];
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
  }, []);

  const fetchUsers = useCallback(
    async (page: number = currentPage) => {
      try {
        setLoading(true);
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const response = await userService.findAllWithPagination({
          limit: ITEMS_PER_PAGE,
          offset,
        });
        setUsers(response.users);
        setTotalUsers(response.total);
        setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    },
    [currentPage],
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchUsers(currentPage);
    }
  }, [currentPage, searchQuery, fetchUsers]);

  useEffect(() => {
    if (!searchQuery.trim() && users.length > 0) {
      setFilteredUsers(users);
    }
  }, [users, searchQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setAllUsers([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) return;

    const filterUsers = (usersList: any[]) => {
      const lowerQuery = query.toLowerCase();
      return usersList.filter(
        (user) =>
          user.fullName.toLowerCase().includes(lowerQuery) ||
          user.documentNumber.includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery),
      );
    };

    if (allUsers.length > 0) {
      const filtered = filterUsers(allUsers);
      setFilteredUsers(filtered);
    } else if (!isLoadingAllUsersRef.current) {
      fetchAllUsers().then((allUsersList) => {
        setAllUsers(allUsersList);
        const filtered = filterUsers(allUsersList);
        setFilteredUsers(filtered);
      });
    }
  }, [searchQuery, allUsers.length, fetchAllUsers]);

  useEffect(() => {
    const customerCreated = sessionStorage.getItem('customerCreated');
    if (customerCreated === 'true') {
      sessionStorage.removeItem('customerCreated');
      setTimeout(() => {
        const currentQuery = searchQuery.trim();
        if (!currentQuery) {
          fetchUsers(1);
          setCurrentPage(1);
        } else {
          fetchAllUsers().then((allUsersList) => {
            const query = currentQuery.toLowerCase();
            setFilteredUsers(
              allUsersList.filter(
                (u) =>
                  u.fullName.toLowerCase().includes(query) ||
                  u.documentNumber.includes(query) ||
                  u.email.toLowerCase().includes(query),
              ),
            );
          });
        }
      }, 100);
    }
  }, []);

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
    if (searchQuery.trim()) {
      const allUsersList = await fetchAllUsers();
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        allUsersList.filter(
          (u) =>
            u.fullName.toLowerCase().includes(query) ||
            u.documentNumber.includes(query) ||
            u.email.toLowerCase().includes(query),
        ),
      );
    } else {
      await fetchUsers(currentPage);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="animate-fade-in-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/20">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
                <p className="text-sm text-muted-foreground">
                  Administra la información de tus clientes
                </p>
              </div>
            </div>
            <Link href="/admin/customers/new-customer">
              <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-fade-in-up stagger-1">
          <div className="bg-emerald-600 px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/20">
                  <Users className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-white">
                  {searchQuery.trim()
                    ? `${filteredUsers.length} resultado${filteredUsers.length !== 1 ? 's' : ''} de ${totalUsers} clientes`
                    : `${totalUsers} cliente${totalUsers !== 1 ? 's' : ''} registrado${totalUsers !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5 pt-5">
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Buscar por nombre, cédula o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-muted/30 border-border/50 focus-visible:bg-background"
                disabled={loading || searching}
              />
            </div>

            {loading || searching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                <span className="ml-2 text-sm text-muted-foreground">
                  {searching ? 'Buscando...' : 'Cargando...'}
                </span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <EmptyState
                title={searchQuery.trim() ? 'Sin resultados' : 'Sin clientes'}
                description={
                  searchQuery.trim()
                    ? 'No se encontraron clientes con ese criterio'
                    : 'No hay clientes registrados todavía'
                }
                action={
                  !searchQuery.trim() ? (
                    <Link href="/admin/customers/new-customer">
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Crear primer cliente
                      </Button>
                    </Link>
                  ) : undefined
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50">
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Nombre
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                        Cédula
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
                        Decl.
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                        Registro
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
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
                                className="h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-600"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/customers/${user.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
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
              </div>
            )}

            {!searchQuery.trim() && totalPages > 1 && filteredUsers.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-4">
                <span className="text-xs text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1 || loading}
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
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          disabled={loading}
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
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages || loading}
                    className="h-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <DeleteCustomerDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setSelectedCustomer(null);
          }}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
