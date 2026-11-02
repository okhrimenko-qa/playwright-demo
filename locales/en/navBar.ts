import { UserData } from "../../interfaces/UserData";

export const navBarText = {
    userMenu: (user: UserData): string => {
        return `${user.firstName} ${user.lastName}`;
    }
}
