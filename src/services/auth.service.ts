import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { User } from '@/types';
import { UserRole } from '@/types/user-role.type';

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
  // El backend puede incluir más campos opcionales
  email?: string;
  phoneNumber?: string;
  role?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Request para registro
export interface RegisterRequest {
  fullName: string;
  documentNumber: string;
  email: string;
  phoneNumber: string;
  password: string;
}

// Respuesta del backend en registro
interface BackendRegisterResponse {
  message: string;
  id: string;
  fullName: string;
  documentNumber: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  token: string;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('[AuthService] Login request:', { endpoint: API_ENDPOINTS.auth.login, credentials: { ...credentials, password: '***' } });
      
      // POST to /auth/login endpoint
      const backendResponse = await apiClient.post<BackendLoginResponse>(API_ENDPOINTS.auth.login, credentials);
      
      console.log('[AuthService] Login response received:', backendResponse);
      
      // IMPORTANTE: Guardar el token ANTES de hacer cualquier otra petición que requiera autenticación
      if (backendResponse.token) {
        apiClient.setAuthToken(backendResponse.token);
        console.log('[AuthService] Token saved to localStorage');
      } else {
        console.warn('[AuthService] No token in response');
        throw new Error('No token received from server');
      }
      
      // Usar /auth/check-auth-status para obtener el usuario completo
      // Este endpoint está disponible para cualquier usuario autenticado (no requiere admin)
      const fullUser = await this.getCurrentUser();
      
      console.log('[AuthService] Full user data fetched:', fullUser);

      return {
        user: fullUser,
        token: backendResponse.token,
      };
    } catch (error) {
      console.error('[AuthService] Login error caught:', error);
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      console.log('[AuthService] Register request:', { endpoint: API_ENDPOINTS.auth.register, data: { ...data, password: '***' } });
      
      // POST to /auth/register endpoint
      const backendResponse = await apiClient.post<BackendRegisterResponse>(API_ENDPOINTS.auth.register, data);
      
      console.log('[AuthService] Register response received:', backendResponse);
      
      // El backend devuelve el usuario completo en la respuesta
      // El rol siempre será 'user' al registrar
      // Las fechas vienen como strings ISO, las convertimos a Date
      const user: User = {
        id: backendResponse.id,
        fullName: backendResponse.fullName,
        documentNumber: backendResponse.documentNumber,
        email: backendResponse.email,
        phoneNumber: backendResponse.phoneNumber,
        role: backendResponse.role === 'user' ? UserRole.USER : UserRole.ADMIN,
        isActive: backendResponse.isActive,
        createdAt: new Date(backendResponse.createdAt),
        updatedAt: new Date(backendResponse.updatedAt),
      };

      return {
        user,
        message: backendResponse.message,
      };
    } catch (error) {
      console.error('[AuthService] Register error caught:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    // GET /auth/check-auth-status endpoint para verificar estado de autenticación y obtener usuario actual
    // Este endpoint está disponible para cualquier usuario autenticado
    const user = await apiClient.get<User>(API_ENDPOINTS.auth.checkAuthStatus);
    
    // Mapear el role del backend (puede venir como string 'user' o 'admin')
    // Asegurar que esté en el formato correcto del enum
    if (typeof user.role === 'string') {
      if (user.role === 'user') {
        user.role = UserRole.USER;
      } else if (user.role === 'admin') {
        user.role = UserRole.ADMIN;
      }
    }
    
    return user;
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

