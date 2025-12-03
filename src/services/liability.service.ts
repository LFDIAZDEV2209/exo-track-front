import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Liability } from '@/types';
import type { PaginatedResponse } from '@/lib/api/types';

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
    const response = await apiClient.get<PaginatedResponse<Liability>>(
      API_ENDPOINTS.liabilities.findAll({
        ...paginationDto,
        declarationId,
      })
    );
    
    // El backend devuelve { data: [...], total, limit, offset }
    const liabilities = response?.data || [];
    
    // Convertir amount de string a number si es necesario
    return liabilities.map((liability: any) => ({
      ...liability,
      amount: typeof liability.amount === 'string' ? parseFloat(liability.amount) : liability.amount,
    }));
  },

  /**
   * Obtener una deuda por término (ID, etc.)
   * @param term - Término de búsqueda
   * @returns Deuda encontrada
   */
  async findOne(term: string): Promise<Liability> {
    const liability = await apiClient.get<Liability>(API_ENDPOINTS.liabilities.findOne(term));
    // Convertir amount de string a number si es necesario
    return {
      ...liability,
      amount: typeof liability.amount === 'string' ? parseFloat(liability.amount) : liability.amount,
    };
  },

  /**
   * Crear una nueva deuda
   * @param data - Datos de la deuda
   * @returns Deuda creada
   */
  async create(data: CreateLiabilityRequest): Promise<Liability> {
    return apiClient.post<Liability>(API_ENDPOINTS.liabilities.create, data);
  },

  /**
   * Actualizar una deuda (usa PUT según backend)
   * @param id - ID de la deuda
   * @param data - Datos a actualizar
   * @returns Deuda actualizada
   */
  async update(id: string, data: Partial<CreateLiabilityRequest>): Promise<Liability> {
    return apiClient.put<Liability>(API_ENDPOINTS.liabilities.update(id), data);
  },

  /**
   * Eliminar una deuda
   * @param id - ID de la deuda
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.liabilities.remove(id));
  },
};

