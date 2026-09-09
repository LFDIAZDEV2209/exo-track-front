'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Plus, Search, Users, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import Link from 'next/link';
import { userService, type SortOrder, type UserSortField } from '@/services';
import { DeleteCustomerDialog } from './DeleteCustomerDialog';
import { CustomersTable } from './CustomersTable';
import { EmptyState } from '@/shared/layout/empty-state';

const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 400;

type StatusFilter = 'all' | 'active' | 'inactive';

export function CustomersPage() {
  const [users, setUsers] = useState<any[]>([]);
  // Carga inicial (pantalla completa) vs. actualización de fondo (conserva foco y tabla)
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // El input NUNCA se deshabilita: esta es la causa raíz del bug de foco perdido
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<UserSortField>('createdAt');
  const [order, setOrder] = useState<SortOrder>('DESC');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Evita que respuestas lentas/stale sobrescriban resultados vigentes
  const requestIdRef = useRef(0);

  const hasActiveFilters = debouncedSearch.trim() !== '' || statusFilter !== 'all';

  // Debounce: el servidor solo recibe el término cuando el usuario pausa
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timerId);
  }, [searchInput]);

  const fetchUsers = useCallback(
    async (options: {
      page: number;
      search: string;
      status: StatusFilter;
      sort: UserSortField;
      sortOrder: SortOrder;
      isInitial?: boolean;
    }) => {
      const requestId = ++requestIdRef.current;
      if (options.isInitial) {
        setInitialLoading(true);
      } else {
        setIsFetching(true);
      }
      setFetchError(null);
      try {
        const offset = (options.page - 1) * ITEMS_PER_PAGE;
        const response = await userService.findAllWithPagination({
          limit: ITEMS_PER_PAGE,
          offset,
          search: options.search.trim() || undefined,
          sortBy: options.sort,
          order: options.sortOrder,
          isActive:
            options.status === 'all' ? undefined : options.status === 'active',
        });
        // Ignora respuestas de requests superados por uno más reciente
        if (requestIdRef.current !== requestId) return;
        setUsers(response.users);
        setTotalUsers(response.total);
        setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
      } catch (error) {
        if (requestIdRef.current !== requestId) return;
        console.error('Error loading users:', error);
        setFetchError('No se pudieron cargar los clientes. Intenta de nuevo.');
      } finally {
        if (requestIdRef.current === requestId) {
          setInitialLoading(false);
          setIsFetching(false);
        }
      }
    },
    [],
  );

  // Carga inicial + refetch server-side ante búsqueda (debounced), filtro, orden o página.
  // Un solo effect: los valores iniciales del estado ya representan la primera carga.
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    const isInitial = !hasLoadedRef.current;
    hasLoadedRef.current = true;
    fetchUsers({
      page: currentPage,
      search: debouncedSearch,
      status: statusFilter,
      sort: sortBy,
      sortOrder: order,
      isInitial,
    });
  }, [debouncedSearch, statusFilter, sortBy, order, currentPage, fetchUsers]);

  // Refresca tras crear un cliente en otra vista
  useEffect(() => {
    if (sessionStorage.getItem('customerCreated') !== 'true') return;
    sessionStorage.removeItem('customerCreated');
    const timerId = setTimeout(() => {
      setSearchInput('');
      setDebouncedSearch('');
      setStatusFilter('all');
      setCurrentPage(1);
      fetchUsers({
        page: 1,
        search: '',
        status: 'all',
        sort: sortBy,
        sortOrder: order,
      });
    }, 100);
    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (field: UserSortField) => {
    if (field === sortBy) {
      setOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      // Declaraciones y fechas: lo reciente/grande primero; texto: A→Z
      setOrder(field === 'fullName' || field === 'documentNumber' || field === 'email' ? 'ASC' : 'DESC');
    }
    setCurrentPage(1);
  };

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setSelectedCustomer({ id: userId, name: userName });
    setDeleteDialogOpen(true);
  };

  const handleDeleted = async () => {
    // Si la página quedó vacía tras eliminar, retrocede una página
    const willBeEmpty = users.length === 1 && currentPage > 1;
    const targetPage = willBeEmpty ? currentPage - 1 : currentPage;
    if (willBeEmpty) setCurrentPage(targetPage);
    await fetchUsers({
      page: targetPage,
      search: debouncedSearch,
      status: statusFilter,
      sort: sortBy,
      sortOrder: order,
    });
  };

  const showEmptyState =
    !initialLoading && !fetchError && users.length === 0 && !isFetching;

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
                  {hasActiveFilters
                    ? `${totalUsers} resultado${totalUsers !== 1 ? 's' : ''} (filtrado)`
                    : `${totalUsers} cliente${totalUsers !== 1 ? 's' : ''} registrado${totalUsers !== 1 ? 's' : ''}`}
                </span>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 text-xs text-white hover:bg-white/20 hover:text-white"
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
          <div className="px-5 pb-5 pt-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  placeholder="Buscar por nombre, cédula o email..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-10 h-10 bg-muted/30 border-border/50 focus-visible:bg-background"
                  aria-label="Buscar clientes"
                  role="searchbox"
                />
                {isFetching ? (
                  <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-emerald-500" />
                ) : (
                  searchInput && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      aria-label="Limpiar búsqueda"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/60 hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )
                )}
              </div>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger
                  className="h-10 w-full sm:w-44 bg-muted/30"
                  aria-label="Filtrar por estado"
                >
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {initialLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Cargando...
                </span>
              </div>
            ) : fetchError ? (
              <EmptyState
                title="Error al cargar"
                description={fetchError}
                action={
                  <Button
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={() =>
                      fetchUsers({
                        page: currentPage,
                        search: debouncedSearch,
                        status: statusFilter,
                        sort: sortBy,
                        sortOrder: order,
                      })
                    }
                  >
                    Reintentar
                  </Button>
                }
              />
            ) : showEmptyState ? (
              <EmptyState
                title={hasActiveFilters ? 'Sin resultados' : 'Sin clientes'}
                description={
                  hasActiveFilters
                    ? 'No se encontraron clientes con esos criterios. Ajusta la búsqueda o limpia los filtros.'
                    : 'No hay clientes registrados todavía'
                }
                action={
                  hasActiveFilters ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleClearFilters}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Limpiar filtros
                    </Button>
                  ) : (
                    <Link href="/admin/customers/new-customer">
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Crear primer cliente
                      </Button>
                    </Link>
                  )
                }
              />
            ) : (
              <div aria-busy={isFetching} className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                <CustomersTable
                  users={users}
                  searchQuery={debouncedSearch}
                  loading={isFetching}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalUsers={totalUsers}
                  sortBy={sortBy}
                  order={order}
                  onSortChange={handleSortChange}
                  onPageChange={handlePageChange}
                  onDeleteClick={handleDeleteClick}
                />
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
