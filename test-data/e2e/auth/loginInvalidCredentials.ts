import { locales } from "../../../locales";

const expectedUrlAfterFailedLogin = /\/auth\/login$/;
const loginPageText = locales.en.loginPage;

export default {
    loginPageText,
    expectedUrlAfterFailedLogin,
}
