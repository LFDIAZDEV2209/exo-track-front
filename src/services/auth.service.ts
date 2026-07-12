import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { User } from '@/types';
import { UserRole } from '@/types/user-role.type';

export interface LoginRequest {
  documentNumber: string;
  password: string;
}

interface BackendLoginResponse {
  message: string;
  id: string;
  documentNumber: string;
  fullName: string;
  password?: string;
  token: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
}

export interface LoginResponse {
  user: User;
}

export interface RegisterRequest {
  fullName: string;
  documentNumber: string;
  email: string;
  phoneNumber: string;
  password: string;
}

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
      
      await apiClient.post<BackendLoginResponse>(API_ENDPOINTS.auth.login, credentials);
      
      console.log('[AuthService] Login successful, cookie set by server');
      
      const fullUser = await this.getCurrentUser();
      
      console.log('[AuthService] Full user data fetched:', fullUser);

      return {
        user: fullUser,
      };
    } catch (error) {
      console.error('[AuthService] Login error caught:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
    }
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      console.log('[AuthService] Register request:', { endpoint: API_ENDPOINTS.auth.register, data: { ...data, password: '***' } });
      
      const backendResponse = await apiClient.post<BackendRegisterResponse>(API_ENDPOINTS.auth.register, data);
      
      console.log('[AuthService] Register response received:', backendResponse);
      
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
    const user = await apiClient.get<User>(API_ENDPOINTS.auth.checkAuthStatus);
    
    if (typeof user.role === 'string') {
      if (user.role === 'user') {
        user.role = UserRole.USER;
      } else if (user.role === 'admin') {
        user.role = UserRole.ADMIN;
      }
    }
    
    return user;
  }
};

