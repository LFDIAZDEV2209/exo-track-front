import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { User } from '@/types';

export interface LoginRequest {
  documentNumber: string;
  password: string;
}

// Respuesta real del backend en login
interface BackendLoginResponse {
  message: string;
  id: string;
  documentNumber: string;
  fullName: string;
  password?: string;
  token: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('[AuthService] Login request:', { endpoint: API_ENDPOINTS.auth.login, credentials: { ...credentials, password: '***' } });
      
      // POST to /auth/login endpoint
      const backendResponse = await apiClient.post<BackendLoginResponse>(API_ENDPOINTS.auth.login, credentials);
      
      console.log('[AuthService] Login response received:', backendResponse);
      
      // El backend solo devuelve id, fullName, documentNumber, password
      // Necesitamos obtener el usuario completo usando el id
      const { userService } = await import('./user.service');
      const fullUser = await userService.findOne(backendResponse.id);
      
      console.log('[AuthService] Full user data fetched:', fullUser);
      
      // Save token to localStorage and apiClient
      if (backendResponse.token) {
        apiClient.setAuthToken(backendResponse.token);
        console.log('[AuthService] Token saved to localStorage');
      } else {
        console.warn('[AuthService] No token in response');
        throw new Error('No token received from server');
      }

      return {
        user: fullUser,
        token: backendResponse.token,
      };
    } catch (error) {
      console.error('[AuthService] Login error caught:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    // GET /auth/check-auth-status endpoint para verificar estado de autenticación y obtener usuario actual
    return apiClient.get<User>(API_ENDPOINTS.auth.checkAuthStatus);
  },

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      // Ignore errors on logout
    } finally {
      // Always clear token locally
      apiClient.clearAuthToken();
    }
  },
};

