import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Income } from '@/types';

export interface CreateIncomeRequest {
  declarationId: string;
  concept: string;
  amount: number;
  source: Income['source'];
}

export const incomeService = {
  async getAll(): Promise<Income[]> {
    return apiClient.get<Income[]>(API_ENDPOINTS.income.list);
  },

  async getById(id: string): Promise<Income> {
    return apiClient.get<Income>(API_ENDPOINTS.income.get(id));
  },

  async getByDeclaration(declarationId: string): Promise<Income[]> {
    return apiClient.get<Income[]>(API_ENDPOINTS.income.getByDeclaration(declarationId));
  },

  async create(data: CreateIncomeRequest): Promise<Income> {
    return apiClient.post<Income>(API_ENDPOINTS.income.create, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async update(id: string, data: Partial<CreateIncomeRequest>): Promise<Income> {
    return apiClient.patch<Income>(API_ENDPOINTS.income.update(id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.income.delete(id));
  },
};

