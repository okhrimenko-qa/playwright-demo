import { UserData } from './UserData';

export interface LoggedInUser extends UserData {
  id: string;
  token: string;
}
