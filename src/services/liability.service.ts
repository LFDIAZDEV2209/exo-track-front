import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Liability } from '@/types';

export interface PaginationDto {
  limit?: number;
  offset?: number;
}

export interface CreateLiabilityRequest {
  declarationId: string;
  concept: string;
  amount: number;
  source: Liability['source'];
}

export const liabilityService = {
  /**
   * Obtener todas las deudas con paginación
   * @param paginationDto - Parámetros de paginación (limit, offset)
   * @param declarationId - ID de la declaración (opcional) para filtrar
   * @returns Array de deudas
   */
  async findAll(
    paginationDto?: PaginationDto,
    declarationId?: string
  ): Promise<Liability[]> {
    return apiClient.get<Liability[]>(
      API_ENDPOINTS.liabilities.findAll({
        ...paginationDto,
        declarationId,
      })
    );
  },

  /**
   * Obtener una deuda por término (ID, etc.)
   * @param term - Término de búsqueda
   * @returns Deuda encontrada
   */
  async findOne(term: string): Promise<Liability> {
    return apiClient.get<Liability>(API_ENDPOINTS.liabilities.findOne(term));
  },

  /**
   * Crear una nueva deuda
   * @param data - Datos de la deuda
   * @returns Deuda creada
   */
  async create(data: CreateLiabilityRequest): Promise<Liability> {
    return apiClient.post<Liability>(API_ENDPOINTS.liabilities.create, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Actualizar una deuda (usa PUT según backend)
   * @param id - ID de la deuda
   * @param data - Datos a actualizar
   * @returns Deuda actualizada
   */
  async update(id: string, data: Partial<CreateLiabilityRequest>): Promise<Liability> {
    return apiClient.put<Liability>(API_ENDPOINTS.liabilities.update(id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Eliminar una deuda
   * @param id - ID de la deuda
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.liabilities.remove(id));
  },
};

