import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Liability } from '@/types';

export interface CreateLiabilityRequest {
  declarationId: string;
  concept: string;
  amount: number;
  source: Liability['source'];
}

export const liabilityService = {
  async getAll(): Promise<Liability[]> {
    return apiClient.get<Liability[]>(API_ENDPOINTS.liabilities.list);
  },

  async getById(id: string): Promise<Liability> {
    return apiClient.get<Liability>(API_ENDPOINTS.liabilities.get(id));
  },

  async getByDeclaration(declarationId: string): Promise<Liability[]> {
    return apiClient.get<Liability[]>(API_ENDPOINTS.liabilities.getByDeclaration(declarationId));
  },

  async create(data: CreateLiabilityRequest): Promise<Liability> {
    return apiClient.post<Liability>(API_ENDPOINTS.liabilities.create, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async update(id: string, data: Partial<CreateLiabilityRequest>): Promise<Liability> {
    return apiClient.patch<Liability>(API_ENDPOINTS.liabilities.update(id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.liabilities.delete(id));
  },
};

