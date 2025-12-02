import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Asset } from '@/types';

export interface PaginationDto {
  limit?: number;
  offset?: number;
}

export interface CreateAssetRequest {
  declarationId: string;
  concept: string;
  amount: number;
  source: Asset['source'];
}

export const assetService = {
  /**
   * Obtener todos los activos con paginación
   * @param paginationDto - Parámetros de paginación (limit, offset)
   * @param declarationId - ID de la declaración (opcional) para filtrar
   * @returns Array de activos
   */
  async findAll(
    paginationDto?: PaginationDto,
    declarationId?: string
  ): Promise<Asset[]> {
    return apiClient.get<Asset[]>(
      API_ENDPOINTS.assets.findAll({
        ...paginationDto,
        declarationId,
      })
    );
  },

  /**
   * Obtener un activo por término (ID, etc.)
   * @param term - Término de búsqueda
   * @returns Activo encontrado
   */
  async findOne(term: string): Promise<Asset> {
    return apiClient.get<Asset>(API_ENDPOINTS.assets.findOne(term));
  },

  /**
   * Crear un nuevo activo
   * @param data - Datos del activo
   * @returns Activo creado
   */
  async create(data: CreateAssetRequest): Promise<Asset> {
    return apiClient.post<Asset>(API_ENDPOINTS.assets.create, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Actualizar un activo (usa PUT según backend)
   * @param id - ID del activo
   * @param data - Datos a actualizar
   * @returns Activo actualizado
   */
  async update(id: string, data: Partial<CreateAssetRequest>): Promise<Asset> {
    return apiClient.put<Asset>(API_ENDPOINTS.assets.update(id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Eliminar un activo
   * @param id - ID del activo
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.assets.remove(id));
  },
};

