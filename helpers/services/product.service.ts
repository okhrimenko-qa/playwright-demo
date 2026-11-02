import type { APIResponse } from '@playwright/test';
import { apiRoutes } from '../../constants';
import { ProductsResponse } from '../../interfaces/api/ProductsResponse';
import { BaseService } from './base.service';

export class ProductService extends BaseService {
  getAll(): Promise<APIResponse<ProductsResponse>> {
    return this.request.get<ProductsResponse>(apiRoutes.product.products);
  }
}
