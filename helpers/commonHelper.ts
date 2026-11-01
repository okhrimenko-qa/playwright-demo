import { randomUUID } from 'node:crypto';
import { UserData } from '../interfaces/UserData';

class CommonHelper {
  generateNewUserData(): UserData {
    return {
      firstName: 'Test',
      lastName: 'Customer',
      email: `qa.${randomUUID()}@example.com`,
      password: `Qa#1${randomUUID().slice(0, 12)}`,
      birthDate: '1990-01-15',
      country: 'UA',
      postalCode: '01001',
      houseNumber: '1',
      street: 'Khreshchatyk',
      city: 'Kyiv',
      state: 'Kyiv',
      phone: '380501234567',
    };
  }
}

export default new CommonHelper();
