import { IProfileRepository, profileRepository } from '@/repositories/profile.repository';
import { Company, UpdateCompanyInput } from '@/types/company';
import { UpdateUserProfileInput, UserProfile } from '@/types/user';

export class ProfileService {
  constructor(private repo: IProfileRepository = profileRepository) {}

  async getUserProfile(userId?: string): Promise<UserProfile> {
    return this.repo.getUserProfile(userId);
  }

  async updateUserProfile(updates: UpdateUserProfileInput, userId?: string): Promise<UserProfile> {
    return this.repo.updateUserProfile(updates, userId);
  }

  async getCompany(companyId?: string): Promise<Company> {
    return this.repo.getCompany(companyId);
  }

  async updateCompany(companyId: string, updates: UpdateCompanyInput): Promise<Company> {
    return this.repo.updateCompany(companyId, updates);
  }
}

export const profileService = new ProfileService();
