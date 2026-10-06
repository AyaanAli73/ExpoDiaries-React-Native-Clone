import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { teamService } from '@/services/team.service';
import { UserRole } from '@/types/auth';
import { InviteTeamMemberInput, TeamMemberStatus } from '@/types/team';

export const teamQueryKeys = queryKeys.team;

export function useTeamMembers(companyId?: string) {
  return useQuery({
    queryKey: queryKeys.team.list(companyId),
    queryFn: () => teamService.getTeamMembers(companyId),
  });
}

export function useTeamMember(id: string) {
  return useQuery({
    queryKey: queryKeys.team.detail(id),
    queryFn: () => teamService.getTeamMemberById(id),
    enabled: Boolean(id),
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, companyId }: { input: InviteTeamMemberInput; companyId?: string }) =>
      teamService.inviteTeamMember(input, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      teamService.updateMemberRole(id, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
}

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TeamMemberStatus }) =>
      teamService.updateMemberStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
}
