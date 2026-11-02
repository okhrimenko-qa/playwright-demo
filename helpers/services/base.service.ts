import type { APIRequestContext } from '@playwright/test';

export class BaseService {
  constructor(protected readonly request: APIRequestContext) { }

  protected authHeader(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
  }
}
