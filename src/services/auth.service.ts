import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { User } from '@/types';

export interface LoginRequest {
  documentNumber: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // For json-server, we'll simulate login by finding the user
    // In real backend, this would be a POST to /auth/login
    const users = await apiClient.get<User[]>(API_ENDPOINTS.users.list);
    const user = users.find((u) => u.documentNumber === credentials.documentNumber);

    if (!user) {
      throw {
        message: 'Usuario no encontrado',
        status: 404,
      };
    }

    // In real backend, password would be validated server-side with bcrypt
    // For json-server demo, we accept password123 for all users
    if (credentials.password !== 'password123') {
      throw {
        message: 'Contraseña incorrecta',
        status: 401,
      };
    }

    if (!user.isActive) {
      throw {
        message: 'Usuario inactivo',
        status: 403,
      };
    }

    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token: 'mock-token',
    };
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.auth.me);
  },

  async logout(): Promise<void> {
    // In real backend, this would invalidate the token
    return Promise.resolve();
  },
};

