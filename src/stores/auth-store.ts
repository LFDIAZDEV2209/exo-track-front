import { create } from 'zustand';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: (user) => {
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  initializeAuth: async () => {
    const { user } = get();
    if (user) return;

    try {
      const fetchedUser = await authService.getCurrentUser();
      set({ user: fetchedUser, isAuthenticated: true });
    } catch (error) {
      console.error('[AuthStore] Failed to restore session:', error);
      set({ user: null, isAuthenticated: false });
    }
  },
}));

