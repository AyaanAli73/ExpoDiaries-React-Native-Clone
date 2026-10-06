import { z } from 'zod';

import { UserRoleSchema } from './auth';

export const UserSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
  role: UserRoleSchema.default('field_staff'),
  avatarUrl: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
  role: UserRoleSchema.default('field_staff'),
  companyId: z.string().default('comp-acme-1'),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateUserProfileInputSchema = UserProfileSchema.partial().omit({
  id: true,
});
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileInputSchema>;

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  plan: z.enum(['starter', 'professional', 'enterprise', 'team', 'free']).default('professional'),
  memberCount: z.number().default(1),
  logoUrl: z.string().optional(),
});
export type Workspace = z.infer<typeof WorkspaceSchema>;
