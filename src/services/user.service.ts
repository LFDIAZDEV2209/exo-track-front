import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { User } from '@/types';
import type { PaginatedResponse } from '@/lib/api/types';
import { UserRole } from '@/types/user-role.type';

export interface PaginationDto {
  limit?: number;
  offset?: number;
}

export interface UsersStats {
  totalUsers: number;
  totalActiveUsers: number;
  averageDeclarationsPerUser: number;
}

// DTO para actualizar usuario (solo los campos que el backend acepta)
export interface UpdateUserDto {
  fullName?: string;
  documentNumber?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
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
    // El backend devuelve el role como string ('user' o 'admin')
    // Necesitamos hacer un cast temporal para acceder al valor como string
    const user = await apiClient.get<User>(API_ENDPOINTS.users.findOne(term)) as any;
    
    // Mapear el role del backend (string) al enum UserRole
    // El backend devuelve 'user' o 'admin' como strings
    if (user.role === 'user' || user.role === UserRole.USER) {
      user.role = UserRole.USER;
    } else if (user.role === 'admin' || user.role === UserRole.ADMIN) {
      user.role = UserRole.ADMIN;
    }
    
    return user as User;
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
   * Solo envía los campos que el backend acepta según el DTO
   * @param id - ID del usuario
   * @param userData - Datos a actualizar (solo campos permitidos)
   * @returns Usuario actualizado
   */
  async update(id: string, userData: UpdateUserDto): Promise<User> {
    // Filtrar solo los campos que el backend acepta
    const payload: UpdateUserDto = {};
    
    if (userData.fullName !== undefined) payload.fullName = userData.fullName;
    if (userData.documentNumber !== undefined) payload.documentNumber = userData.documentNumber;
    if (userData.email !== undefined) payload.email = userData.email;
    if (userData.phoneNumber !== undefined) payload.phoneNumber = userData.phoneNumber;
    if (userData.password !== undefined && userData.password.trim() !== '') {
      payload.password = userData.password;
    }
    
    return apiClient.put<User>(API_ENDPOINTS.users.update(id), payload);
  },

  /**
   * Eliminar un usuario
   * @param id - ID del usuario
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.users.remove(id));
  },
};

