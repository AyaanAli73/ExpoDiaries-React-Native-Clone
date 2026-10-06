import { z } from 'zod';

import { UserRoleSchema } from './auth';

export const TeamMemberStatusSchema = z.enum(['active', 'invited', 'disabled']);
export type TeamMemberStatus = z.infer<typeof TeamMemberStatusSchema>;

export const TeamMemberSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  userId: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  role: UserRoleSchema.default('field_staff'),
  title: z.string().optional(),
  avatarUrl: z.string().optional(),
  phone: z.string().optional(),
  activeEventsCount: z.number().default(0),
  leadsCapturedCount: z.number().default(0),
  status: TeamMemberStatusSchema.default('active'),
  invitedBy: z.string().optional(),
  joinedAt: z.string(),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

export const InviteTeamMemberInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: UserRoleSchema.default('field_staff'),
  title: z.string().optional(),
});
export type InviteTeamMemberInput = z.infer<typeof InviteTeamMemberInputSchema>;
