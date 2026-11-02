import type { APIResponse } from '@playwright/test';
import { apiRoutes } from '../../constants';
import { CreateInvoicePayload } from '../../interfaces/api/CreateInvoicePayload';
import { InvoiceResponse } from '../../interfaces/api/InvoiceResponse';
import { BaseService } from './base.service';

export class InvoiceService extends BaseService {
  create(payload: CreateInvoicePayload, token: string): Promise<APIResponse<InvoiceResponse>> {
    return this.request.post<InvoiceResponse>(apiRoutes.invoice.invoices, { data: payload, headers: this.authHeader(token) });
  }

  getById(id: string, token: string): Promise<APIResponse<InvoiceResponse>> {
    return this.request.get<InvoiceResponse>(`${apiRoutes.invoice.invoices}/${id}`, { headers: this.authHeader(token) });
  }
}
