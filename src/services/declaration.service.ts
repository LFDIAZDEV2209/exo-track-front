import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Declaration } from '@/types';
import type { PaginatedResponse } from '@/lib/api/types';

export interface PaginationDto {
  limit?: number;
  offset?: number;
}

export interface CreateDeclarationRequest {
  userId: string;
  taxableYear: number;
  description?: string;
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

export const declarationService = {
  /**
   * Obtener todas las declaraciones con paginación
   * @param paginationDto - Parámetros de paginación (limit, offset)
   * @param userId - ID del usuario (opcional) para filtrar por usuario
   * @returns Array de declaraciones
   */
  async findAll(
    paginationDto?: PaginationDto,
    userId?: string
  ): Promise<Declaration[]> {
    const response = await apiClient.get<PaginatedResponse<Declaration>>(
      API_ENDPOINTS.declarations.findAll({
        ...paginationDto,
        userId,
      })
    );

    return response.data || [];
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
   * Actualizar una declaración (usa PUT según backend)
   * @param id - ID de la declaración
   * @param data - Datos a actualizar
   * @returns Declaración actualizada
   */
  async update(id: string, data: UpdateDeclarationRequest): Promise<Declaration> {
    return apiClient.put<Declaration>(API_ENDPOINTS.declarations.update(id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Eliminar una declaración
   * @param id - ID de la declaración
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.declarations.remove(id));
  },
};

