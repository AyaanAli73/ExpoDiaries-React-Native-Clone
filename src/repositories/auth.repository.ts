import { apiClient } from '@/lib/api-client';
import { mockUsers } from '@/repositories/mocks/users.mock';
import { AuthSession, AuthUser, LoginCredentials, RegisterInput } from '@/types/auth';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  register(input: RegisterInput): Promise<AuthSession>;
  verifyOtp(email: string, code: string): Promise<boolean>;
  requestPasswordReset(email: string): Promise<boolean>;
  getCurrentUser(): Promise<AuthUser | null>;
  logout(): Promise<void>;
}

class AuthRepository implements IAuthRepository {
  private users: AuthUser[] = mockUsers.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    organizationId: u.companyId,
    avatarUrl: u.avatarUrl,
  }));

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(350);
      const user =
        this.users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase()) ||
        this.users[0];
      return {
        token: `mock-jwt-${user.id}-${Date.now()}`,
        refreshToken: `mock-refresh-${user.id}-${Date.now()}`,
        user,
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      };
    }
    return apiClient.request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(input: RegisterInput): Promise<AuthSession> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(400);
      const newUser: AuthUser = {
        id: `usr-${Date.now()}`,
        email: input.email,
        name: input.name,
        role: 'admin',
        organizationId: `comp-${Date.now()}`,
      };
      this.users.push(newUser);
      return {
        token: `mock-jwt-${newUser.id}-${Date.now()}`,
        refreshToken: `mock-refresh-${newUser.id}-${Date.now()}`,
        user: newUser,
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      };
    }
    return apiClient.request<AuthSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async verifyOtp(email: string, code: string): Promise<boolean> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(350);
      return code.trim().length === 6;
    }
    return apiClient.request<boolean>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(300);
      return true;
    }
    return apiClient.request<boolean>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);
      return this.users[0] || null;
    }
    return apiClient.request<AuthUser>('/auth/me');
  }

  async logout(): Promise<void> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(100);
      return;
    }
    return apiClient.request<void>('/auth/logout', { method: 'POST' });
  }
}

export const authRepository = new AuthRepository();
