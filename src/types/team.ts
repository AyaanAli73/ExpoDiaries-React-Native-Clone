import { z } from 'zod';

import { UserRoleSchema } from './auth';

export const TeamMemberStatusSchema = z.enum(['active', 'invited', 'disabled']);
export type TeamMemberStatus = z.infer<typeof TeamMemberStatusSchema>;

export const TeamMemberPresenceSchema = z.enum(['on_duty', 'break', 'offline']);
export type TeamMemberPresence = z.infer<typeof TeamMemberPresenceSchema>;

export const TeamPermissionSchema = z.enum([
  'leads:scan',
  'leads:assign',
  'leads:export',
  'leads:delete',
  'leads:edit',
  'team:invite',
  'team:manage_roles',
  'analytics:view_roi',
  'crm:sync',
]);
export type TeamPermission = z.infer<typeof TeamPermissionSchema>;

export const ROLE_DEFAULT_PERMISSIONS: Record<z.infer<typeof UserRoleSchema>, TeamPermission[]> = {
  admin: [
    'leads:scan',
    'leads:assign',
    'leads:export',
    'leads:delete',
    'leads:edit',
    'team:invite',
    'team:manage_roles',
    'analytics:view_roi',
    'crm:sync',
  ],
  manager: [
    'leads:scan',
    'leads:assign',
    'leads:export',
    'leads:edit',
    'team:invite',
    'analytics:view_roi',
    'crm:sync',
  ],
  field_staff: ['leads:scan', 'leads:assign', 'leads:edit'],
  viewer: ['analytics:view_roi'],
};

export const TeamMemberActivitySchema = z.object({
  id: z.string(),
  memberId: z.string(),
  type: z.enum([
    'lead_captured',
    'lead_assigned',
    'meeting_scheduled',
    'badge_scanned',
    'note_added',
  ]),
  title: z.string(),
  description: z.string(),
  leadId: z.string().optional(),
  leadName: z.string().optional(),
  timestamp: z.string(),
});
export type TeamMemberActivity = z.infer<typeof TeamMemberActivitySchema>;

export const TeamMemberEventActivitySchema = z.object({
  eventId: z.string(),
  eventName: z.string(),
  boothStation: z.string(),
  leadsCaptured: z.number(),
  hotLeadsCount: z.number(),
  meetingsCount: z.number(),
  status: z.enum(['active', 'completed']),
});
export type TeamMemberEventActivity = z.infer<typeof TeamMemberEventActivitySchema>;

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
  bio: z.string().optional(),
  activeEventsCount: z.number().default(0),
  leadsCapturedCount: z.number().default(0),
  hotLeadsCount: z.number().default(0),
  meetingsCount: z.number().default(0),
  status: TeamMemberStatusSchema.default('active'),
  presence: TeamMemberPresenceSchema.default('on_duty'),
  boothStation: z.string().optional(),
  canScan: z.boolean().default(true),
  canAssign: z.boolean().default(true),
  canExport: z.boolean().default(false),
  permissions: z.array(TeamPermissionSchema).default([]),
  recentActivities: z.array(TeamMemberActivitySchema).default([]),
  eventActivities: z.array(TeamMemberEventActivitySchema).default([]),
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

