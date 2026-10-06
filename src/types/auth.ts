import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'manager', 'field_staff', 'viewer']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema.default('field_staff'),
  organizationId: z.string(),
  avatarUrl: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
  onboardingCompleted: z.boolean().optional(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthSessionSchema = z.object({
  token: z.string(),
  refreshToken: z.string().optional(),
  user: AuthUserSchema,
  expiresAt: z.string(),
});
export type AuthSession = z.infer<typeof AuthSessionSchema>;

export const LoginCredentialsSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

export const RegisterInputSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationName: z.string().min(2, 'Organization name is required'),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const VerificationInputSchema = z.object({
  email: z.string().email('Valid email is required'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});
export type VerificationInput = z.infer<typeof VerificationInputSchema>;

export const PasswordResetInputSchema = z.object({
  email: z.string().email('Valid work email is required'),
});
export type PasswordResetInput = z.infer<typeof PasswordResetInputSchema>;

