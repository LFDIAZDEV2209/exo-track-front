'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, Search, FileText, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import Link from 'next/link';
import { userService, declarationService } from '@/services';

export function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [usersWithActivity, setUsersWithActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Usar directamente el endpoint de users (devuelve array desde userService)
        const usersData = await userService.findAll();
        
        // Obtener todas las declaraciones para calcular última actividad
        const declarationsResponse = await declarationService.findAll();
        const declarations = declarationsResponse?.data || declarationsResponse || [];
        
        // Agregar última actividad a cada usuario
        const usersWithLastActivity = usersData.map((user: any) => {
          const userDeclarations = declarations.filter((d: any) => d.userId === user.id);
          const lastDeclaration = userDeclarations.sort(
            (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          
          return {
            ...user,
            lastActivity: lastDeclaration?.updatedAt || user.createdAt,
          };
        });

        setUsers(usersWithLastActivity);
        setUsersWithActivity(usersWithLastActivity);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setUsersWithActivity(users);
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

    setUsersWithActivity(filtered);
  }, [searchQuery, users]);

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
            {usersWithActivity.length} clientes registrados
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
          ) : usersWithActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay clientes registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Declaraciones</TableHead>
                  <TableHead>Última Actividad</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersWithActivity.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.documentNumber}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        {user.totalDeclarations || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.lastActivity)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/customers/${user.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
