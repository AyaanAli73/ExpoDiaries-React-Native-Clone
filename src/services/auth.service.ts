import { authRepository, IAuthRepository } from '@/repositories/auth.repository';
import { AuthSession, AuthUser, LoginCredentials, RegisterInput } from '@/types/auth';

export class AuthService {
  constructor(private repo: IAuthRepository = authRepository) {}

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    return this.repo.login(credentials);
  }

  async register(input: RegisterInput): Promise<AuthSession> {
    return this.repo.register(input);
  }

  async verifyOtp(email: string, code: string): Promise<boolean> {
    return this.repo.verifyOtp(email, code);
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    return this.repo.requestPasswordReset(email);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.repo.getCurrentUser();
  }

  async logout(): Promise<void> {
    return this.repo.logout();
  }
}

export const authService = new AuthService();
