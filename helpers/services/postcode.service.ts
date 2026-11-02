import type { APIResponse } from '@playwright/test';
import { apiRoutes } from '../../constants';
import { PostcodeLookupResponse } from '../../interfaces/api/PostcodeLookupResponse';
import { BaseService } from './base.service';

export class PostcodeService extends BaseService {
  lookup(country: string, postcode: string): Promise<APIResponse<PostcodeLookupResponse>> {
    return this.request.get<PostcodeLookupResponse>(apiRoutes.postcode.lookup, { params: { country, postcode } });
  }
}
