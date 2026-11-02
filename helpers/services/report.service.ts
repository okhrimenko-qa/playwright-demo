import type { APIResponse } from '@playwright/test';
import { apiRoutes } from '../../constants';
import { BaseService } from './base.service';

export class ReportService extends BaseService {
  getTotalSalesOfYears(token: string): Promise<APIResponse> {
    return this.request.get(apiRoutes.report.totalSalesOfYears, { headers: this.authHeader(token) });
  }
}
