import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Declaration } from '@/types';
import { DeclarationStatus } from '@/types';
import type { PaginatedResponse } from '@/lib/api/types';

export interface PaginationDto {
  limit?: number;
  offset?: number;
}

export interface CreateDeclarationRequest {
  userId: string;
  taxableYear: number;
  status: DeclarationStatus;
  description?: string;
}

export interface ExogenaItemRequest {
  concept: string;
  amount: number;
  sourceDetail?: string;
  reporterName?: string;
  reporterNit?: string;
  subtypeId?: string;
}

export interface ExogenaCustomItemRequest extends ExogenaItemRequest {
  conceptTypeId: string;
}

export interface CreateFromExogenaRequest {
  userId: string;
  taxableYear: number;
  description?: string;
  assets?: ExogenaItemRequest[];
  incomes?: ExogenaItemRequest[];
  liabilities?: ExogenaItemRequest[];
  unclassified?: ExogenaItemRequest[];
  custom?: ExogenaCustomItemRequest[];
}

export type MoveItemFromKind = 'asset' | 'income' | 'liability' | 'custom' | 'unclassified';
export type MoveItemToKind = 'asset' | 'income' | 'liability' | 'custom';

export interface MoveItemRequest {
  itemId: string;
  from: MoveItemFromKind;
  to: MoveItemToKind;
  customTypeId?: string;
  subtypeId?: string;
}

export interface MoveItemResponse {
  item: any;
  from: MoveItemFromKind;
  to: MoveItemToKind;
  subtypeCleared?: boolean;
}

export interface UpdateDeclarationRequest {
  status?: Declaration['status'];
  description?: string;
  filePath?: string;
}

export interface DeclarationsStats {
  totalDeclarations: number;
  totalPending: number;
  completedThisMonth: number;
  completionRate: number;
}

export interface RecentActivityItem {
  id: string;
  taxableYear: number;
  status: string;
  description: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    documentNumber: string;
  };
}

export interface FindAllDeclarationsResponse {
  declarations: Declaration[];
  total: number;
  limit: number;
  offset: number;
}

export const declarationService = {

  /**
   * Obtener todas las declaraciones con paginación (incluye información de paginación)
   * @param paginationDto - Parámetros de paginación (limit, offset)
   * @param userId - ID del usuario (opcional) para filtrar por usuario
   * @returns Objeto con declaraciones e información de paginación
   */
  async findAllWithPagination(
    paginationDto?: PaginationDto,
    userId?: string
  ): Promise<FindAllDeclarationsResponse> {
    const response = await apiClient.get<PaginatedResponse<Declaration>>(
      API_ENDPOINTS.declarations.findAll({
        ...paginationDto,
        userId,
      })
    );

    return {
      declarations: response?.data || [],
      total: response?.total || 0,
      limit: response?.limit || 10,
      offset: response?.offset || 0,
    };
  },

  /**
   * Obtener una declaración por ID
   * @param id - ID de la declaración
   * @returns Declaración encontrada
   */
  async findOne(id: string): Promise<Declaration> {
    return apiClient.get<Declaration>(API_ENDPOINTS.declarations.findOne(id));
  },

  /**
   * Obtener estadísticas de declaraciones
   * @returns Estadísticas de declaraciones
   */
  async getStats(): Promise<DeclarationsStats> {
    return apiClient.get<DeclarationsStats>(API_ENDPOINTS.declarations.stats);
  },

  /**
   * Obtener actividad reciente de declaraciones
   * @returns Array de declaraciones con información de usuario
   */
  async getRecentActivity(): Promise<RecentActivityItem[]> {
    return apiClient.get<RecentActivityItem[]>(API_ENDPOINTS.declarations.recentActivity);
  },

  /**
   * Crear una nueva declaración
   * @param data - Datos de la declaración
   * @returns Declaración creada
   */
  async create(data: CreateDeclarationRequest): Promise<Declaration> {
    return apiClient.post<Declaration>(API_ENDPOINTS.declarations.create, data);
  },

  /**
   * Crear una declaración junto con sus patrimonios, ingresos y deudas desde
   * un reporte exógeno (una sola petición y una sola transacción en el backend)
   * @param data - Datos de la declaración y de los ítems importados
   * @returns Declaración creada con conteos por tipo de ítem
   */
  async createFromExogena(data: CreateFromExogenaRequest): Promise<{
    declaration: Declaration;
    counts: { assets: number; incomes: number; liabilities: number; unclassified: number; custom?: number };
  }> {
    return apiClient.post(API_ENDPOINTS.declarations.importExogena, data);
  },

  /**
   * Mueve (re-cataloga) un ítem entre patrimonios/ingresos/deudas/tipos
   * personalizados, o cataloga un no clasificado. Transacción atómica.
   */
  async moveItem(declarationId: string, data: MoveItemRequest): Promise<MoveItemResponse> {
    return apiClient.post<MoveItemResponse>(API_ENDPOINTS.declarations.moveItem(declarationId), data);
  },

  /**
   * Actualizar una declaración (usa PUT según backend)
   * @param id - ID de la declaración
   * @param data - Datos a actualizar
   * @returns Declaración actualizada
   */
  async update(id: string, data: UpdateDeclarationRequest): Promise<Declaration> {
    return apiClient.put<Declaration>(API_ENDPOINTS.declarations.update(id), data);
  },

  /**
   * Eliminar una declaración
   * @param id - ID de la declaración
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.declarations.remove(id));
  },

  /**
   * Obtener años gravables únicos de un usuario
   * @param userId - ID del usuario
   * @returns Array con los años gravables ordenados de forma descendente
   */
  async getTaxableYearsByUser(userId: string): Promise<number[]> {
    return apiClient.get<number[]>(API_ENDPOINTS.declarations.taxableYears(userId));
  },
};

