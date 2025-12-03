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
}

export interface FindAllLiabilitiesResponse {
  liabilities: Liability[];
  total: number;
  limit: number;
  offset: number;
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
   * Obtener todas las deudas con paginación (incluye información de paginación)
   * @param paginationDto - Parámetros de paginación (limit, offset)
   * @param declarationId - ID de la declaración (opcional) para filtrar
   * @returns Objeto con deudas e información de paginación
   */
  async findAllWithPagination(
    paginationDto?: PaginationDto,
    declarationId?: string
  ): Promise<FindAllLiabilitiesResponse> {
    const response = await apiClient.get<PaginatedResponse<Liability>>(
      API_ENDPOINTS.liabilities.findAll({
        ...paginationDto,
        declarationId,
      })
    );
    
    const liabilities = response?.data || [];
    
    // Convertir amount de string a number si es necesario
    const convertedLiabilities = liabilities.map((liability: any) => ({
      ...liability,
      amount: typeof liability.amount === 'string' ? parseFloat(liability.amount) : liability.amount,
    }));
    
    return {
      liabilities: convertedLiabilities,
      total: response?.total || 0,
      limit: response?.limit || 10,
      offset: response?.offset || 0,
    };
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
   * @param data - Datos a actualizar (solo concept y amount, sin declarationId ni source)
   * @returns Deuda actualizada
   */
  async update(id: string, data: { concept?: string; amount?: number }): Promise<Liability> {
    // Filtrar solo los campos permitidos para actualizar
    const payload: { concept?: string; amount?: number } = {};
    if (data.concept !== undefined) payload.concept = data.concept;
    if (data.amount !== undefined) payload.amount = data.amount;
    
    return apiClient.put<Liability>(API_ENDPOINTS.liabilities.update(id), payload);
  },

  /**
   * Eliminar una deuda
   * @param id - ID de la deuda
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.liabilities.remove(id));
  },
};

