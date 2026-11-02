import type { APIResponse } from '@playwright/test';
import { apiRoutes } from '../../constants';
import { CartResponse } from '../../interfaces/api/CartResponse';
import { BaseService } from './base.service';

export class CartService extends BaseService {
  create(): Promise<APIResponse<CartResponse>> {
    return this.request.post<CartResponse>(apiRoutes.cart.carts);
  }

  addItem(cartId: string, productId: string, quantity: number): Promise<APIResponse> {
    return this.request.post(`${apiRoutes.cart.carts}/${cartId}`, { data: { product_id: productId, quantity } });
  }
}
