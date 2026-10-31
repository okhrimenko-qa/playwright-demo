import type { APIRequestContext, APIResponse } from '@playwright/test';
import { UserData } from '../interfaces/UserData';
import { TokenResponse } from '../interfaces/TokenResponse';

export class ApiHelper {
  constructor(private readonly request: APIRequestContext) {}

  register(user: UserData): Promise<APIResponse> {
    return this.request.post('/users/register', { data: user });
  }

  getUserToken(email: string, password: string): Promise<APIResponse<TokenResponse>> {
    return this.request.post<TokenResponse>('/users/login', { data: { email, password } });
  }
}
