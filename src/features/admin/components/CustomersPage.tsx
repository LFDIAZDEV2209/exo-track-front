'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Plus, Loader2, Search, Users } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import Link from 'next/link';
import { userService } from '@/services';
import { DeleteCustomerDialog } from './DeleteCustomerDialog';
import { CustomersTable } from './CustomersTable';
import { EmptyState } from '@/shared/layout/empty-state';

const ITEMS_PER_PAGE = 10;

export function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const isLoadingAllUsersRef = useRef(false);

  const derivedFilteredUsers = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return users;
    if (allUsers.length === 0) return [];

    const lowerQuery = query.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.fullName.toLowerCase().includes(lowerQuery) ||
        user.documentNumber.includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery),
    );
  }, [searchQuery, users, allUsers]);

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

  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;
  const fetchUsersRef = useRef(fetchUsers);
  fetchUsersRef.current = fetchUsers;
  const fetchAllUsersRef = useRef(fetchAllUsers);
  fetchAllUsersRef.current = fetchAllUsers;

  useEffect(() => {
    fetchUsersRef.current(1);
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setAllUsers((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    if (allUsers.length > 0 || isLoadingAllUsersRef.current) return;
    fetchAllUsers();
  }, [searchQuery, allUsers, fetchAllUsers]);

  useEffect(() => {
    const customerCreated = sessionStorage.getItem('customerCreated');
    if (customerCreated !== 'true') return;

    sessionStorage.removeItem('customerCreated');
    const timerId = setTimeout(() => {
      const currentQuery = searchQueryRef.current.trim();
      if (!currentQuery) {
        setCurrentPage(1);
        fetchUsersRef.current(1);
      } else {
        fetchAllUsersRef.current();
      }
    }, 100);
    return () => clearTimeout(timerId);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setSelectedCustomer({ id: userId, name: userName });
    setDeleteDialogOpen(true);
  };

  const handleDeleted = async () => {
    if (searchQuery.trim()) {
      const allUsersList = await fetchAllUsers();
      setAllUsers(allUsersList);
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
                    ? `${derivedFilteredUsers.length} resultado${derivedFilteredUsers.length !== 1 ? 's' : ''} de ${totalUsers} clientes`
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
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  if (value.trim()) {
                    setCurrentPage(1);
                  } else {
                    fetchUsers(currentPage);
                  }
                }}
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
            ) : derivedFilteredUsers.length === 0 ? (
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
              <CustomersTable
                users={derivedFilteredUsers}
                searchQuery={searchQuery}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                totalUsers={totalUsers}
                onPageChange={handlePageChange}
                onDeleteClick={handleDeleteClick}
              />
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
