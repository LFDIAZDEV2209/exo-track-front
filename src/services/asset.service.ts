import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Asset } from '@/types';
import type { PaginatedResponse } from '@/lib/api/types';

export interface PaginationDto {
  limit?: number;
  offset?: number;
}

export interface CreateAssetRequest {
  declarationId: string;
  concept: string;
  amount: number;
}

export interface FindAllAssetsResponse {
  assets: Asset[];
  total: number;
  limit: number;
  offset: number;
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
    const response = await apiClient.get<PaginatedResponse<Asset>>(
      API_ENDPOINTS.assets.findAll({
        ...paginationDto,
        declarationId,
      })
    );
    
    // El backend devuelve { data: [...], total, limit, offset }
    const assets = response?.data || [];
    
    // Convertir amount de string a number si es necesario
    return assets.map((asset: any) => ({
      ...asset,
      amount: typeof asset.amount === 'string' ? parseFloat(asset.amount) : asset.amount,
    }));
  },

  /**
   * Obtener todos los activos con paginación (incluye información de paginación)
   * @param paginationDto - Parámetros de paginación (limit, offset)
   * @param declarationId - ID de la declaración (opcional) para filtrar
   * @returns Objeto con activos e información de paginación
   */
  async findAllWithPagination(
    paginationDto?: PaginationDto,
    declarationId?: string
  ): Promise<FindAllAssetsResponse> {
    const response = await apiClient.get<PaginatedResponse<Asset>>(
      API_ENDPOINTS.assets.findAll({
        ...paginationDto,
        declarationId,
      })
    );
    
    const assets = response?.data || [];
    
    // Convertir amount de string a number si es necesario
    const convertedAssets = assets.map((asset: any) => ({
      ...asset,
      amount: typeof asset.amount === 'string' ? parseFloat(asset.amount) : asset.amount,
    }));
    
    return {
      assets: convertedAssets,
      total: response?.total || 0,
      limit: response?.limit || 10,
      offset: response?.offset || 0,
    };
  },

  /**
   * Obtener un activo por término (ID, etc.)
   * @param term - Término de búsqueda
   * @returns Activo encontrado
   */
  async findOne(term: string): Promise<Asset> {
    const asset = await apiClient.get<Asset>(API_ENDPOINTS.assets.findOne(term));
    // Convertir amount de string a number si es necesario
    return {
      ...asset,
      amount: typeof asset.amount === 'string' ? parseFloat(asset.amount) : asset.amount,
    };
  },

  /**
   * Crear un nuevo activo
   * @param data - Datos del activo
   * @returns Activo creado
   */
  async create(data: CreateAssetRequest): Promise<Asset> {
    return apiClient.post<Asset>(API_ENDPOINTS.assets.create, data);
  },

  /**
   * Actualizar un activo (usa PUT según backend)
   * @param id - ID del activo
   * @param data - Datos a actualizar (solo concept y amount, sin declarationId ni source)
   * @returns Activo actualizado
   */
  async update(id: string, data: { concept?: string; amount?: number }): Promise<Asset> {
    // Filtrar solo los campos permitidos para actualizar
    const payload: { concept?: string; amount?: number } = {};
    if (data.concept !== undefined) payload.concept = data.concept;
    if (data.amount !== undefined) payload.amount = data.amount;
    
    return apiClient.put<Asset>(API_ENDPOINTS.assets.update(id), payload);
  },

  /**
   * Eliminar un activo
   * @param id - ID del activo
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.assets.remove(id));
  },
};

