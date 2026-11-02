import type { APIResponse } from '@playwright/test';
import { apiRoutes } from '../../constants';
import { TokenResponse } from '../../interfaces/TokenResponse';
import { CreateUserPayload } from '../../interfaces/api/CreateUserPayload';
import { UserResponse } from '../../interfaces/api/UserResponse';
import { UserData } from '../../interfaces/UserData';
import { BaseService } from './base.service';

export class UserService extends BaseService {
  register(userData: UserData): Promise<APIResponse<UserResponse>> {
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

    return this.request.post<UserResponse>(apiRoutes.user.register, { data: createUserPayload });
  }

  getToken(email: string, password: string): Promise<APIResponse<TokenResponse>> {
    return this.request.post<TokenResponse>(apiRoutes.user.login, { data: { email, password } });
  }

  getById(id: string, token: string): Promise<APIResponse<UserResponse>> {
    return this.request.get<UserResponse>(`${apiRoutes.user.users}/${id}`, { headers: this.authHeader(token) });
  }

  getAll(token: string): Promise<APIResponse> {
    return this.request.get(apiRoutes.user.users, { headers: this.authHeader(token) });
  }
}
