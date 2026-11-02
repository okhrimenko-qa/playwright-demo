import type { APIResponse } from '@playwright/test';
import { apiRoutes } from '../../constants';
import { BrandResponse } from '../../interfaces/api/BrandResponse';
import { BaseService } from './base.service';

export class BrandService extends BaseService {
  getAll(): Promise<APIResponse<BrandResponse[]>> {
    return this.request.get<BrandResponse[]>(apiRoutes.brand.brands);
  }

  getById(id: string): Promise<APIResponse<BrandResponse>> {
    return this.request.get<BrandResponse>(`${apiRoutes.brand.brands}/${id}`);
  }

  delete(id: string, token: string): Promise<APIResponse> {
    return this.request.delete(`${apiRoutes.brand.brands}/${id}`, { headers: this.authHeader(token) });
  }
}
