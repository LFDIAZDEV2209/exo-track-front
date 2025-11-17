import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Asset } from '@/types';

export interface CreateAssetRequest {
  declarationId: string;
  concept: string;
  amount: number;
  source: Asset['source'];
}

export const assetService = {
  async getAll(): Promise<Asset[]> {
    return apiClient.get<Asset[]>(API_ENDPOINTS.assets.list);
  },

  async getById(id: string): Promise<Asset> {
    return apiClient.get<Asset>(API_ENDPOINTS.assets.get(id));
  },

  async getByDeclaration(declarationId: string): Promise<Asset[]> {
    return apiClient.get<Asset[]>(API_ENDPOINTS.assets.getByDeclaration(declarationId));
  },

  async create(data: CreateAssetRequest): Promise<Asset> {
    return apiClient.post<Asset>(API_ENDPOINTS.assets.create, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async update(id: string, data: Partial<CreateAssetRequest>): Promise<Asset> {
    return apiClient.patch<Asset>(API_ENDPOINTS.assets.update(id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.assets.delete(id));
  },
};

