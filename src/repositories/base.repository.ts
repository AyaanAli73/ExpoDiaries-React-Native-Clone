import { PaginatedResult, PaginationParams } from '@/types/common';

export interface IBaseRepository<T, TCreateInput, TUpdateInput> {
  getAll(pagination?: PaginationParams, filters?: Record<string, unknown>): Promise<PaginatedResult<T>>;
  getById(id: string): Promise<T | null>;
  create(input: TCreateInput): Promise<T>;
  update(id: string, input: TUpdateInput): Promise<T>;
  delete(id: string): Promise<boolean>;
}
