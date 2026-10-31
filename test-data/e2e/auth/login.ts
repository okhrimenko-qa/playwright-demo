import { UserData } from "../../../interfaces/UserData";

const expectedUrlAfterLogin = /\/account$/;
const expectedPageTitle = 'My account';

function getExpectedNavBarText(customer: UserData): string {
    return `${customer.first_name} ${customer.last_name}`;
}

export default {
    expectedUrlAfterLogin,
    expectedPageTitle,
    getExpectedNavBarText,
}
