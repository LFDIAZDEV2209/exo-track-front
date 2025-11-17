import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { User } from '@/types';

export const userService = {
  async getAll(): Promise<User[]> {
    return apiClient.get<User[]>(API_ENDPOINTS.users.list);
  },

  async getById(id: string): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.users.get(id));
  },

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return apiClient.post<User>(API_ENDPOINTS.users.create, {
      ...user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async update(id: string, user: Partial<User>): Promise<User> {
    return apiClient.patch<User>(API_ENDPOINTS.users.update(id), {
      ...user,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.users.delete(id));
  },
};

