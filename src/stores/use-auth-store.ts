import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { authService } from '@/services/auth.service';
import { AuthSession, AuthUser, LoginCredentials, RegisterInput } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  verificationPendingEmail: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  setVerificationPendingEmail: (email: string | null) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        id: 'usr-1',
        name: 'Alex Mercer',
        email: 'alex@acme.io',
        role: 'admin',
        organizationId: 'org-acme',
      },
      token: 'mock-jwt-init',
      isAuthenticated: true,
      isLoading: false,
      isInitialized: false,
      error: null,
      verificationPendingEmail: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const session: AuthSession = await authService.login(credentials);
          set({
            user: session.user,
            token: session.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: unknown) {
          const error = err as Error;
          set({ error: error.message || 'Login failed', isLoading: false });
          throw err;
        }
      },

      register: async (input: RegisterInput) => {
        set({ isLoading: true, error: null });
        try {
          const session: AuthSession = await authService.register(input);
          set({
            user: session.user,
            token: session.token,
            verificationPendingEmail: input.email,
            // Keep unauthenticated until verification is confirmed
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (err: unknown) {
          const error = err as Error;
          set({ error: error.message || 'Registration failed', isLoading: false });
          throw err;
        }
      },

      verifyOtp: async (code: string) => {
        const email = get().verificationPendingEmail || get().user?.email || 'alex@acme.io';
        set({ isLoading: true, error: null });
        try {
          const verified = await authService.verifyOtp(email, code);
          if (verified) {
            set({
              isAuthenticated: true,
              verificationPendingEmail: null,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({ error: 'Invalid verification code. Enter 123456.', isLoading: false });
            return false;
          }
        } catch (err: unknown) {
          const error = err as Error;
          set({ error: error.message || 'Verification failed', isLoading: false });
          return false;
        }
      },

      setVerificationPendingEmail: (email) => set({ verificationPendingEmail: email }),

      logout: () => {
        authService.logout().catch(() => {});
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          verificationPendingEmail: null,
          error: null,
        });
      },

      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
    }),
    {
      name: 'expodiaries-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        verificationPendingEmail: state.verificationPendingEmail,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setInitialized(true);
      },
    }
  )
);
