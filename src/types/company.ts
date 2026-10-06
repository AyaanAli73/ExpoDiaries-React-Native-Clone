import { z } from 'zod';

export const CompanyPlanSchema = z.enum(['starter', 'professional', 'enterprise']);
export type CompanyPlan = z.infer<typeof CompanyPlanSchema>;

export const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('US'),
  postalCode: z.string().optional(),
});
export type Address = z.infer<typeof AddressSchema>;

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Company name is required'),
  slug: z.string(),
  industry: z.string().default('Technology'),
  website: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().optional(),
  plan: CompanyPlanSchema.default('professional'),
  address: AddressSchema.optional(),
  leadCap: z.number().default(5000),
  memberCount: z.number().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Company = z.infer<typeof CompanySchema>;

export const UpdateCompanyInputSchema = CompanySchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type UpdateCompanyInput = z.infer<typeof UpdateCompanyInputSchema>;
