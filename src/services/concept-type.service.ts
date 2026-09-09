import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { ConceptType } from '@/types';

export interface CreateConceptTypeRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateConceptTypeRequest {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export const conceptTypeService = {
  /**
   * Listar tipos de concepto personalizados (ordenados por nombre en el backend)
   */
  async findAll(): Promise<ConceptType[]> {
    const response = await apiClient.get<ConceptType[]>(API_ENDPOINTS.conceptTypes.findAll);
    return response || [];
  },

  /**
   * Crear un nuevo tipo de concepto personalizado
   */
  async create(data: CreateConceptTypeRequest): Promise<ConceptType> {
    return apiClient.post<ConceptType>(API_ENDPOINTS.conceptTypes.create, {
      name: data.name.trim(),
      ...(data.description?.trim() ? { description: data.description.trim() } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    });
  },

  /**
   * Actualizar un tipo de concepto (nombre, descripción, activo/inactivo)
   */
  async update(id: string, data: UpdateConceptTypeRequest): Promise<ConceptType> {
    const payload: UpdateConceptTypeRequest = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.description !== undefined) payload.description = data.description;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    return apiClient.put<ConceptType>(API_ENDPOINTS.conceptTypes.update(id), payload);
  },

  /**
   * Eliminar un tipo (el backend lo bloquea con 409 si tiene registros)
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.conceptTypes.remove(id));
  },
};
