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
}

export interface FindAllIncomesResponse {
  incomes: Income[];
  total: number;
  limit: number;
  offset: number;
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
   * Obtener todos los ingresos con paginación (incluye información de paginación)
   * @param paginationDto - Parámetros de paginación (limit, offset)
   * @param declarationId - ID de la declaración (opcional) para filtrar
   * @returns Objeto con ingresos e información de paginación
   */
  async findAllWithPagination(
    paginationDto?: PaginationDto,
    declarationId?: string
  ): Promise<FindAllIncomesResponse> {
    const response = await apiClient.get<PaginatedResponse<Income>>(
      API_ENDPOINTS.income.findAll({
        ...paginationDto,
        declarationId,
      })
    );
    
    const incomes = response?.data || [];
    
    // Convertir amount de string a number si es necesario
    const convertedIncomes = incomes.map((income: any) => ({
      ...income,
      amount: typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount,
    }));
    
    return {
      incomes: convertedIncomes,
      total: response?.total || 0,
      limit: response?.limit || 10,
      offset: response?.offset || 0,
    };
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
   * @param data - Datos a actualizar (solo concept y amount, sin declarationId ni source)
   * @returns Ingreso actualizado
   */
  async update(id: string, data: { concept?: string; amount?: number }): Promise<Income> {
    // Filtrar solo los campos permitidos para actualizar
    const payload: { concept?: string; amount?: number } = {};
    if (data.concept !== undefined) payload.concept = data.concept;
    if (data.amount !== undefined) payload.amount = data.amount;
    
    return apiClient.put<Income>(API_ENDPOINTS.income.update(id), payload);
  },

  /**
   * Eliminar un ingreso
   * @param id - ID del ingreso
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.income.remove(id));
  },
};

