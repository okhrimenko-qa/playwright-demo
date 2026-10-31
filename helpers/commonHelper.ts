import { randomUUID } from 'node:crypto';
import { UserData } from '../interfaces/UserData';

export function generateNewUserData(): UserData {
  return {
    first_name: 'Test',
    last_name: 'Customer',
    email: `qa.${randomUUID()}@example.com`,
    password: `Qa#1${randomUUID().slice(0, 12)}`,
  };
}
