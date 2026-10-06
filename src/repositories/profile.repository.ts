import { apiClient } from '@/lib/api-client';
import { mockCompanies } from '@/repositories/mocks/companies.mock';
import { mockUsers } from '@/repositories/mocks/users.mock';
import { Company, UpdateCompanyInput } from '@/types/company';
import { UpdateUserProfileInput, UserProfile } from '@/types/user';

export interface IProfileRepository {
  getUserProfile(userId?: string): Promise<UserProfile>;
  updateUserProfile(updates: UpdateUserProfileInput, userId?: string): Promise<UserProfile>;
  getCompany(companyId?: string): Promise<Company>;
  updateCompany(companyId: string, updates: UpdateCompanyInput): Promise<Company>;
}

class ProfileRepository implements IProfileRepository {
  private user: UserProfile = {
    id: mockUsers[0].id,
    name: mockUsers[0].name,
    email: mockUsers[0].email,
    role: mockUsers[0].role,
    avatarUrl: mockUsers[0].avatarUrl,
    title: mockUsers[0].title,
    phone: mockUsers[0].phone,
    bio: mockUsers[0].bio,
    companyId: mockUsers[0].companyId,
  };

  private companies: Company[] = [...mockCompanies];

  async getUserProfile(userId?: string): Promise<UserProfile> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);
      if (userId && userId !== this.user.id) {
        const found = mockUsers.find((u) => u.id === userId);
        if (found) {
          return {
            id: found.id,
            name: found.name,
            email: found.email,
            role: found.role,
            avatarUrl: found.avatarUrl,
            title: found.title,
            phone: found.phone,
            bio: found.bio,
            companyId: found.companyId,
          };
        }
      }
      return { ...this.user };
    }
    return apiClient.request<UserProfile>(userId ? `/users/${userId}/profile` : '/profile');
  }

  async updateUserProfile(updates: UpdateUserProfileInput, _userId?: string): Promise<UserProfile> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(250);
      this.user = {
        ...this.user,
        ...updates,
      };
      return { ...this.user };
    }
    return apiClient.request<UserProfile>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getCompany(companyId = 'comp-acme-1'): Promise<Company> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);
      return this.companies.find((c) => c.id === companyId) || this.companies[0];
    }
    return apiClient.request<Company>(`/companies/${companyId}`);
  }

  async updateCompany(companyId: string, updates: UpdateCompanyInput): Promise<Company> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(250);
      const index = this.companies.findIndex((c) => c.id === companyId);
      if (index === -1) throw new Error('Company not found');
      this.companies[index] = {
        ...this.companies[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return this.companies[index];
    }
    return apiClient.request<Company>(`/companies/${companyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }
}

export const profileRepository = new ProfileRepository();
