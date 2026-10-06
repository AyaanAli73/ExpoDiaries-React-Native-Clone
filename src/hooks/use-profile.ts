import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { profileService } from '@/services/profile.service';
import { UpdateCompanyInput } from '@/types/company';
import { UpdateUserProfileInput } from '@/types/user';

export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: () => profileService.getUserProfile(userId),
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ updates, userId }: { updates: UpdateUserProfileInput; userId?: string }) =>
      profileService.updateUserProfile(updates, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useCompany(companyId?: string) {
  return useQuery({
    queryKey: queryKeys.company.detail(companyId),
    queryFn: () => profileService.getCompany(companyId),
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, updates }: { companyId: string; updates: UpdateCompanyInput }) =>
      profileService.updateCompany(companyId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.company.detail(variables.companyId) });
    },
  });
}
