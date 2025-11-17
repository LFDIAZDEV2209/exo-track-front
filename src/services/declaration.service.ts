import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Declaration } from '@/types';

export interface CreateDeclarationRequest {
  userId: string;
  taxableYear: number;
  description?: string;
}

export interface UpdateDeclarationRequest {
  status?: Declaration['status'];
  description?: string;
  filePath?: string;
}

export const declarationService = {
  async getAll(): Promise<Declaration[]> {
    return apiClient.get<Declaration[]>(API_ENDPOINTS.declarations.list);
  },

  async getById(id: string): Promise<Declaration> {
    return apiClient.get<Declaration>(API_ENDPOINTS.declarations.get(id));
  },

  async getByUserId(userId: string): Promise<Declaration[]> {
    return apiClient.get<Declaration[]>(API_ENDPOINTS.declarations.getByUser(userId));
  },

  async create(data: CreateDeclarationRequest): Promise<Declaration> {
    // Get user to include userFullName
    const { userService } = await import('./user.service');
    const user = await userService.getById(data.userId);

    return apiClient.post<Declaration>(API_ENDPOINTS.declarations.create, {
      ...data,
      userFullName: user.fullName,
      status: 'borrador',
      filePath: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async update(id: string, data: UpdateDeclarationRequest): Promise<Declaration> {
    return apiClient.patch<Declaration>(API_ENDPOINTS.declarations.update(id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.declarations.delete(id));
  },
};

