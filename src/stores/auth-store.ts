import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

const TOKEN_KEY = 'auth_token';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
  initializeAuth: () => Promise<void>;
}

// Helper functions for token management
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: getStoredToken(),
      isAuthenticated: false,
      login: (user, token) => {
        setStoredToken(token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        removeStoredToken();
        set({ user: null, token: null, isAuthenticated: false });
      },
      setToken: (token) => {
        setStoredToken(token);
        set({ token });
      },
      initializeAuth: async () => {
        // Si hay un token pero no hay usuario, intentar restaurar la sesión
        const token = getStoredToken();
        const currentState = get();
        
        if (token && !currentState.user) {
          try {
            // Verificar el token con el backend
            const { authService } = await import('@/services/auth.service');
            const user = await authService.getCurrentUser();
            
            // Si el token es válido, restaurar la sesión
            set({ user, token, isAuthenticated: true });
          } catch (error) {
            // Si el token es inválido, limpiar todo
            console.error('[AuthStore] Failed to restore session:', error);
            removeStoredToken();
            set({ user: null, token: null, isAuthenticated: false });
          }
        } else if (token && currentState.user) {
          // Si hay token y usuario, asegurar que isAuthenticated sea true
          set({ isAuthenticated: true });
        } else if (!token) {
          // Si no hay token, limpiar todo
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        token: state.token, // También persistir el token
      }),
      // Al rehidratar, sincronizar el token de localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          const token = getStoredToken();
          if (token && token !== state.token) {
            state.token = token;
          }
          // Si hay token pero isAuthenticated es false, intentar restaurar
          if (token && !state.isAuthenticated && state.user) {
            state.isAuthenticated = true;
          }
        }
      },
    }
  )
);

