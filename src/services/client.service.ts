import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Client, User } from '@/types';
import { declarationService } from './declaration.service';

export const clientService = {
  async getAll(): Promise<Client[]> {
    const users = await apiClient.get<User[]>(API_ENDPOINTS.clients.list);
    
    // Transform users to clients and add totalDeclarations
    const clients: Client[] = await Promise.all(
      users.map(async (user) => {
        const declarations = await declarationService.getByUserId(user.id);
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

    return clients;
  },

  async getById(id: string): Promise<Client> {
    const user = await apiClient.get<User>(API_ENDPOINTS.clients.get(id));
    const declarations = await declarationService.getByUserId(id);

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

  async create(client: Omit<Client, 'id' | 'totalDeclarations' | 'createdAt'> & { password?: string }): Promise<Client> {
    // In real backend, password would be hashed server-side
    // For json-server demo, we'll use a simple hash placeholder
    const passwordHash = client.password 
      ? '$2a$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq' 
      : '$2a$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKq';

    const { password, ...clientData } = client;
    
    const user = await apiClient.post<User>(API_ENDPOINTS.clients.create, {
      ...clientData,
      passwordHash,
      role: 'cliente',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

  async update(id: string, client: Partial<Client>): Promise<Client> {
    const user = await apiClient.patch<User>(API_ENDPOINTS.clients.update(id), {
      ...client,
      updatedAt: new Date().toISOString(),
    });

    const declarations = await declarationService.getByUserId(id);

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

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.clients.delete(id));
  },
};

