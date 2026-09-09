import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { UnclassifiedItem } from '@/types';
import type { PaginatedResponse } from '@/lib/api/types';

export interface PaginationDto {
  limit?: number;
  offset?: number;
}

export interface FindAllUnclassifiedItemsResponse {
  items: UnclassifiedItem[];
  total: number;
  limit: number;
  offset: number;
}

const toNumber = (item: any): UnclassifiedItem => ({
  ...item,
  amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount,
});

export const unclassifiedItemService = {
  /**
   * Obtener ítems no catalogados con paginación (filtrable por declaración)
   */
  async findAllWithPagination(
    paginationDto?: PaginationDto,
    declarationId?: string,
  ): Promise<FindAllUnclassifiedItemsResponse> {
    const response = await apiClient.get<PaginatedResponse<UnclassifiedItem>>(
      API_ENDPOINTS.unclassifiedItems.findAll({
        ...paginationDto,
        declarationId,
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
   * Eliminar un ítem no catalogado (descartarlo definitivamente)
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.unclassifiedItems.remove(id));
  },
};
