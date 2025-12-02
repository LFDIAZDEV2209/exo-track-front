import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { User } from '@/types';
import type { PaginatedResponse } from '@/lib/api/types';

export interface PaginationDto {
  limit?: number;
  offset?: number;
}

export interface UsersStats {
  totalUsers: number;
  totalActiveUsers: number;
  averageDeclarationsPerUser: number;
}

export const userService = {
  /**
   * Obtener todos los usuarios con paginación
   * @param paginationDto - Parámetros de paginación (limit, offset)
   * @returns Array de usuarios
   */
  async findAll(paginationDto?: PaginationDto): Promise<User[]> {
    const response = await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.users.findAll(paginationDto)
    );
    
    return response?.data || [];
  },

  /**
   * Obtener un usuario por término (ID, cédula, email, etc.)
   * @param term - Término de búsqueda
   * @returns Usuario encontrado
   */
  async findOne(term: string): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.users.findOne(term));
  },

  /**
   * Obtener estadísticas de usuarios
   * @returns Estadísticas de usuarios
   */
  async getStats(): Promise<UsersStats> {
    return apiClient.get<UsersStats>(API_ENDPOINTS.users.stats);
  },

  /**
   * Actualizar un usuario (usa PUT según backend)
   * @param id - ID del usuario
   * @param user - Datos a actualizar
   * @returns Usuario actualizado
   */
  async update(id: string, user: Partial<User>): Promise<User> {
    return apiClient.put<User>(API_ENDPOINTS.users.update(id), {
      ...user,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Eliminar un usuario
   * @param id - ID del usuario
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.users.remove(id));
  },
};

