import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

const TOKEN_KEY = 'auth_token';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean; // Flag para saber si el store ha sido rehidratado
  login: (user: User, token: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
  initializeAuth: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
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
      _hasHydrated: false,
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
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
      initializeAuth: async () => {
        const token = getStoredToken();
        const currentState = get();
        
        if (token && !currentState.user) {
          try {
            const { authService } = await import('@/services/auth.service');
            const user = await authService.getCurrentUser();
            set({ user, token, isAuthenticated: true });
          } catch (error) {
            console.error('[AuthStore] Failed to restore session:', error);
            removeStoredToken();
            set({ user: null, token: null, isAuthenticated: false });
          }
        } else if (token && currentState.user) {
          set({ isAuthenticated: true });
        } else if (!token) {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const token = getStoredToken();
          
          // Sincronizar token de localStorage
          if (token && token !== state.token) {
            state.token = token;
          }
          
          // Si hay token y usuario persistido, restaurar isAuthenticated
          if (token && state.user) {
            state.isAuthenticated = true;
          } else if (!token) {
            // Si no hay token, limpiar todo
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
          }
          
          // Marcar como rehidratado
          state._hasHydrated = true;
        }
      },
    }
  )
);

