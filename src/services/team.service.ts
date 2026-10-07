import { ITeamRepository, teamRepository } from '@/repositories/team.repository';
import { UserRole } from '@/types/auth';
import { InviteTeamMemberInput, TeamMember, TeamMemberPresence, TeamMemberStatus } from '@/types/team';

export class TeamService {
  constructor(private repo: ITeamRepository = teamRepository) {}

  async getTeamMembers(companyId?: string): Promise<TeamMember[]> {
    return this.repo.getTeamMembers(companyId);
  }

  async getTeamMemberById(id: string): Promise<TeamMember | null> {
    return this.repo.getTeamMemberById(id);
  }

  async inviteTeamMember(input: InviteTeamMemberInput, companyId?: string): Promise<TeamMember> {
    return this.repo.inviteTeamMember(input, companyId);
  }

  async updateMemberRole(id: string, role: UserRole): Promise<TeamMember> {
    return this.repo.updateTeamMemberRole(id, role);
  }

  async updateMemberStatus(id: string, status: TeamMemberStatus): Promise<TeamMember> {
    return this.repo.updateTeamMemberStatus(id, status);
  }

  async updateMemberPresence(id: string, presence: TeamMemberPresence): Promise<TeamMember> {
    return this.repo.updateTeamMemberPresence(id, presence);
  }
}

export const teamService = new TeamService();
