import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { ConceptSubtype, ItemScope } from '@/types';

export interface CreateConceptSubtypeRequest {
  name: string;
  scope: ItemScope;
  conceptTypeId?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateConceptSubtypeRequest {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface FindAllConceptSubtypesParams {
  scope?: ItemScope;
  conceptTypeId?: string;
  isActive?: boolean;
}

export const conceptSubtypeService = {
  /**
   * Listar subtipos (filtrable por ámbito, tipo personalizado y estado)
   */
  async findAll(params?: FindAllConceptSubtypesParams): Promise<ConceptSubtype[]> {
    const response = await apiClient.get<ConceptSubtype[]>(
      API_ENDPOINTS.conceptSubtypes.findAll(params),
    );
    return response || [];
  },

  /**
   * Crear un subtipo autogestionado
   */
  async create(data: CreateConceptSubtypeRequest): Promise<ConceptSubtype> {
    return apiClient.post<ConceptSubtype>(API_ENDPOINTS.conceptSubtypes.create, {
      name: data.name.trim(),
      scope: data.scope,
      ...(data.conceptTypeId ? { conceptTypeId: data.conceptTypeId } : {}),
      ...(data.description?.trim() ? { description: data.description.trim() } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    });
  },

  /**
   * Actualizar un subtipo (nombre, descripción, activo/inactivo).
   * El ámbito no cambia: para eso se crea uno nuevo y se re-cataloga.
   */
  async update(id: string, data: UpdateConceptSubtypeRequest): Promise<ConceptSubtype> {
    const payload: UpdateConceptSubtypeRequest = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.description !== undefined) payload.description = data.description;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    return apiClient.put<ConceptSubtype>(API_ENDPOINTS.conceptSubtypes.update(id), payload);
  },

  /**
   * Eliminar un subtipo (el backend lo bloquea con 409 si tiene registros)
   */
  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.conceptSubtypes.remove(id));
  },
};
