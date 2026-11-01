import type { APIRequestContext, APIResponse } from '@playwright/test';
import { TokenResponse } from '../interfaces/TokenResponse';
import { CreateUserPayload } from '../interfaces/api/CreateUserPayload';
import { UserData } from '../interfaces/UserData';

export class ApiHelper {
  constructor(private readonly request: APIRequestContext) { }

  register(userData: UserData): Promise<APIResponse> {
    const createUserPayload: CreateUserPayload = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      dob: userData.birthDate,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
      address: {
        street: userData.street,
        city: userData.city,
        state: userData.state,
        country: userData.country,
        postal_code: userData.postalCode
      }
    };

    return this.request.post('/users/register', { data: createUserPayload });
  }

  getUserToken(email: string, password: string): Promise<APIResponse<TokenResponse>> {
    return this.request.post<TokenResponse>('/users/login', { data: { email, password } });
  }
}
