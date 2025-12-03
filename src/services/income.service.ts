import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Income } from '@/types';
import type { PaginatedResponse } from '@/lib/api/types';

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
    const response = await apiClient.get<PaginatedResponse<Income>>(
      API_ENDPOINTS.income.findAll({
        ...paginationDto,
        declarationId,
      })
    );
    
    // El backend devuelve { data: [...], total, limit, offset }
    const incomes = response?.data || [];
    
    // Convertir amount de string a number si es necesario
    return incomes.map((income: any) => ({
      ...income,
      amount: typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount,
    }));
  },

  /**
   * Obtener un ingreso por término (ID, etc.)
   * @param term - Término de búsqueda
   * @returns Ingreso encontrado
   */
  async findOne(term: string): Promise<Income> {
    const income = await apiClient.get<Income>(API_ENDPOINTS.income.findOne(term));
    // Convertir amount de string a number si es necesario
    return {
      ...income,
      amount: typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount,
    };
  },

  /**
   * Crear un nuevo ingreso
   * @param data - Datos del ingreso
   * @returns Ingreso creado
   */
  async create(data: CreateIncomeRequest): Promise<Income> {
    return apiClient.post<Income>(API_ENDPOINTS.income.create, data);
  },

  /**
   * Actualizar un ingreso (usa PUT según backend)
   * @param id - ID del ingreso
   * @param data - Datos a actualizar
   * @returns Ingreso actualizado
   */
  async update(id: string, data: Partial<CreateIncomeRequest>): Promise<Income> {
    return apiClient.put<Income>(API_ENDPOINTS.income.update(id), data);
  },

  /**
   * Eliminar un ingreso
   * @param id - ID del ingreso
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.income.remove(id));
  },
};

