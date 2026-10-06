import { Company } from '@/types/company';

export const mockCompanies: Company[] = [
  {
    id: 'comp-acme-1',
    name: 'Acme Systems Core',
    slug: 'acme-systems',
    industry: 'Enterprise SaaS & Cloud Infrastructure',
    website: 'https://acmesystems.io',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&q=80',
    plan: 'enterprise',
    address: {
      street: '100 Innovation Boulevard, Suite 500',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      postalCode: '94105',
    },
    leadCap: 25000,
    memberCount: 18,
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2026-09-20T12:00:00.000Z',
  },
  {
    id: 'comp-nexus-2',
    name: 'Nexus Dynamics AI',
    slug: 'nexus-dynamics',
    industry: 'Industrial Robotics & Automation',
    website: 'https://nexusdynamics.ai',
    logoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=120&q=80',
    plan: 'professional',
    address: {
      street: '420 Technology Drive',
      city: 'Austin',
      state: 'TX',
      country: 'US',
      postalCode: '78701',
    },
    leadCap: 10000,
    memberCount: 8,
    createdAt: '2025-06-10T10:00:00.000Z',
    updatedAt: '2026-08-15T14:30:00.000Z',
  },
];
