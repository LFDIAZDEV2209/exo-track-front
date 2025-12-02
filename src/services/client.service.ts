import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { User } from '@/types';
import { userService } from './user.service';
import { declarationService } from './declaration.service';

// Client is essentially a User with role 'cliente' plus totalDeclarations
export interface Client {
  id: string;
  documentNumber: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  totalDeclarations: number;
  createdAt: Date;
}

export const clientService = {
  /**
   * Obtener todos los clientes (usuarios con role 'cliente')
   * @param paginationDto - Parámetros de paginación opcionales
   * @returns Array de clientes
   */
  async getAll(paginationDto?: { limit?: number; offset?: number }): Promise<Client[]> {
    // Get all users and filter by role 'cliente'
    const clients = await userService.findAll(paginationDto);
    
    // Transform users to clients and add totalDeclarations
    const clientsWithDeclarations: Client[] = await Promise.all(
      clients.map(async (user) => {
        const declarations = await declarationService.findAll(undefined, user.id);
        return {
          id: user.id,
          documentNumber: user.documentNumber,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          totalDeclarations: declarations.length,
          createdAt: user.createdAt || new Date(),
        };
      })
    );

    return clientsWithDeclarations;
  },

  /**
   * Obtener un cliente por ID
   * @param id - ID del cliente
   * @returns Cliente encontrado
   */
  async getById(id: string): Promise<Client> {
    const user = await userService.findOne(id);
    const declarations = await declarationService.findAll(undefined, id);

    return {
      id: user.id,
      documentNumber: user.documentNumber,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      totalDeclarations: declarations.length,
      createdAt: user.createdAt || new Date(),
    };
  },

  /**
   * Crear un nuevo cliente (usuario con role 'cliente')
   * @param client - Datos del cliente
   * @returns Cliente creado
   */
  async create(client: Omit<Client, 'id' | 'totalDeclarations' | 'createdAt'> & { password?: string }): Promise<Client> {
    // Use auth/register endpoint to create user with role 'cliente'
    // Note: The backend should handle password hashing
    const { password, ...clientData } = client;
    
    // Register new user through auth/register endpoint
    const { authService } = await import('./auth.service');
    const { API_ENDPOINTS } = await import('@/lib/api/config');
    
    const user = await apiClient.post<User>(API_ENDPOINTS.auth.register, {
      ...clientData,
      password: password || 'password123', // Default password if not provided
      role: 'cliente',
    });

    return {
      id: user.id,
      documentNumber: user.documentNumber,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      totalDeclarations: 0,
      createdAt: user.createdAt || new Date(),
    };
  },

  /**
   * Actualizar un cliente
   * @param id - ID del cliente
   * @param client - Datos a actualizar
   * @returns Cliente actualizado
   */
  async update(id: string, client: Partial<Client>): Promise<Client> {
    const user = await userService.update(id, {
      ...client,
    } as Partial<User>);

    const declarations = await declarationService.findAll(undefined, id);

    return {
      id: user.id,
      documentNumber: user.documentNumber,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      totalDeclarations: declarations.length,
      createdAt: user.createdAt || new Date(),
    };
  },

  /**
   * Eliminar un cliente
   * @param id - ID del cliente
   */
  async delete(id: string): Promise<void> {
    return userService.remove(id);
  },
};

