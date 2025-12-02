import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Income } from '@/types';

export interface PaginationDto {
  limit?: number;
  offset?: number;
}

export interface CreateIncomeRequest {
  declarationId: string;
  concept: string;
  amount: number;
  source: Income['source'];
}

export const incomeService = {
  /**
   * Obtener todos los ingresos con paginación
   * @param paginationDto - Parámetros de paginación (limit, offset)
   * @param declarationId - ID de la declaración (opcional) para filtrar
   * @returns Array de ingresos
   */
  async findAll(
    paginationDto?: PaginationDto,
    declarationId?: string
  ): Promise<Income[]> {
    return apiClient.get<Income[]>(
      API_ENDPOINTS.income.findAll({
        ...paginationDto,
        declarationId,
      })
    );
  },

  /**
   * Obtener un ingreso por término (ID, etc.)
   * @param term - Término de búsqueda
   * @returns Ingreso encontrado
   */
  async findOne(term: string): Promise<Income> {
    return apiClient.get<Income>(API_ENDPOINTS.income.findOne(term));
  },

  /**
   * Crear un nuevo ingreso
   * @param data - Datos del ingreso
   * @returns Ingreso creado
   */
  async create(data: CreateIncomeRequest): Promise<Income> {
    return apiClient.post<Income>(API_ENDPOINTS.income.create, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Actualizar un ingreso (usa PUT según backend)
   * @param id - ID del ingreso
   * @param data - Datos a actualizar
   * @returns Ingreso actualizado
   */
  async update(id: string, data: Partial<CreateIncomeRequest>): Promise<Income> {
    return apiClient.put<Income>(API_ENDPOINTS.income.update(id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Eliminar un ingreso
   * @param id - ID del ingreso
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.income.remove(id));
  },
};

