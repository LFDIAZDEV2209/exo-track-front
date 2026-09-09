import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { CustomItem } from '@/types';
import type { PaginatedResponse } from '@/lib/api/types';

export interface PaginationDto {
  limit?: number;
  offset?: number;
}

export interface CreateCustomItemRequest {
  declarationId: string;
  conceptTypeId: string;
  concept: string;
  amount: number;
}

export interface FindAllCustomItemsResponse {
  items: CustomItem[];
  total: number;
  limit: number;
  offset: number;
}

const toNumber = (item: any): CustomItem => ({
  ...item,
  amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount,
});

export const customItemService = {
  /**
   * Obtener ítems personalizados con paginación (filtrable por declaración y tipo)
   */
  async findAllWithPagination(
    paginationDto?: PaginationDto,
    declarationId?: string,
    conceptTypeId?: string,
  ): Promise<FindAllCustomItemsResponse> {
    const response = await apiClient.get<PaginatedResponse<CustomItem>>(
      API_ENDPOINTS.customItems.findAll({
        ...paginationDto,
        declarationId,
        conceptTypeId,
      }),
    );

    const items = (response?.data || []).map(toNumber);

    return {
      items,
      total: response?.total || 0,
      limit: response?.limit || 10,
      offset: response?.offset || 0,
    };
  },

  /**
   * Crear un ítem bajo un tipo de concepto personalizado
   */
  async create(data: CreateCustomItemRequest): Promise<CustomItem> {
    return apiClient.post<CustomItem>(API_ENDPOINTS.customItems.create, data).then(toNumber);
  },

  /**
   * Actualizar un ítem (concept, amount y/o cambio de tipo)
   */
  async update(
    id: string,
    data: { concept?: string; amount?: number; conceptTypeId?: string },
  ): Promise<CustomItem> {
    const payload: { concept?: string; amount?: number; conceptTypeId?: string } = {};
    if (data.concept !== undefined) payload.concept = data.concept;
    if (data.amount !== undefined) payload.amount = data.amount;
    if (data.conceptTypeId !== undefined) payload.conceptTypeId = data.conceptTypeId;

    return apiClient.put<CustomItem>(API_ENDPOINTS.customItems.update(id), payload).then(toNumber);
  },

  /**
   * Eliminar un ítem personalizado
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.customItems.remove(id));
  },
};
