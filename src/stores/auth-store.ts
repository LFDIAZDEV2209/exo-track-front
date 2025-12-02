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
    (set) => ({
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
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

