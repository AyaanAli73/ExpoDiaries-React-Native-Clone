import { apiClient } from '@/lib/api-client';
import { mockTeamMembers } from '@/repositories/mocks/team.mock';
import { UserRole } from '@/types/auth';
import { InviteTeamMemberInput, TeamMember, TeamMemberStatus } from '@/types/team';

export interface ITeamRepository {
  getTeamMembers(companyId?: string): Promise<TeamMember[]>;
  getTeamMemberById(id: string): Promise<TeamMember | null>;
  inviteTeamMember(input: InviteTeamMemberInput, companyId?: string): Promise<TeamMember>;
  updateTeamMemberRole(id: string, role: UserRole): Promise<TeamMember>;
  updateTeamMemberStatus(id: string, status: TeamMemberStatus): Promise<TeamMember>;
}

class TeamRepository implements ITeamRepository {
  private members: TeamMember[] = [...mockTeamMembers];

  async getTeamMembers(companyId?: string): Promise<TeamMember[]> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(200);
      if (companyId) return this.members.filter((m) => m.companyId === companyId);
      return [...this.members];
    }
    return apiClient.request<TeamMember[]>(companyId ? `/companies/${companyId}/team` : '/team');
  }

  async getTeamMemberById(id: string): Promise<TeamMember | null> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);
      return this.members.find((m) => m.id === id) || null;
    }
    return apiClient.request<TeamMember>(`/team/${id}`);
  }

  async inviteTeamMember(input: InviteTeamMemberInput, companyId = 'comp-acme-1'): Promise<TeamMember> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(300);
      const newMember: TeamMember = {
        id: `tm-${Date.now()}`,
        companyId,
        userId: `usr-${Date.now()}`,
        name: input.name,
        email: input.email,
        role: input.role,
        title: input.title,
        activeEventsCount: 0,
        leadsCapturedCount: 0,
        status: 'invited',
        joinedAt: new Date().toISOString(),
      };
      this.members.push(newMember);
      return newMember;
    }
    return apiClient.request<TeamMember>('/team/invite', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateTeamMemberRole(id: string, role: UserRole): Promise<TeamMember> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(200);
      const index = this.members.findIndex((m) => m.id === id);
      if (index === -1) throw new Error('Team member not found');
      this.members[index] = { ...this.members[index], role };
      return this.members[index];
    }
    return apiClient.request<TeamMember>(`/team/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async updateTeamMemberStatus(id: string, status: TeamMemberStatus): Promise<TeamMember> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(200);
      const index = this.members.findIndex((m) => m.id === id);
      if (index === -1) throw new Error('Team member not found');
      this.members[index] = { ...this.members[index], status };
      return this.members[index];
    }
    return apiClient.request<TeamMember>(`/team/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const teamRepository = new TeamRepository();
