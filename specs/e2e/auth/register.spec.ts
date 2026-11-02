import { expect } from "@playwright/test";
import { test } from "../../../fixtures/fixtures";
import { RegistrationPage } from "../../../pages/registration.page";
import { LoginPage } from "../../../pages/login.page";
import testData from '../../../test-data/e2e/auth/register';
import { AccountPage } from "../../../pages/account.page";
import commonHelper from "../../../helpers/commonHelper";

test('Visitor registers via the registration form and can sign in @T53f8a73d @ui @auth @regression @P1', async ({
    page,
}) => {
    const registrationPage = new RegistrationPage(page);
    const loginPage = new LoginPage(page);
    const accountPage = new AccountPage(page);
    const userData = commonHelper.generateNewUserData();
    const {
        navBarText,
        accountPageText,
        expectedUrlAfterLogin,
    } = testData;

    await registrationPage.goto();
    await registrationPage.firstNameField.fill(userData.firstName);
    await registrationPage.lastNameField.fill(userData.lastName);
    await registrationPage.birthDateField.fill(userData.birthDate);
    await registrationPage.selectCountry(userData.country);
    await registrationPage.postalCodeField.fill(userData.postalCode);
    await registrationPage.houseNumberField.fill(userData.houseNumber);
    await registrationPage.streetField.fill(userData.street);
    await registrationPage.cityField.fill(userData.city);
    await registrationPage.stateField.fill(userData.state);
    await registrationPage.phoneField.fill(userData.phone);
    await registrationPage.emailAddressField.fill(userData.email);
    await registrationPage.passwordField.fill(userData.password);

    await expect(registrationPage.firstNameField).toHaveValue(userData.firstName);
    await expect(registrationPage.lastNameField).toHaveValue(userData.lastName);
    await expect(registrationPage.birthDateField).toHaveValue(userData.birthDate);
    await expect(registrationPage.countryDropdown).toHaveValue(userData.country);
    await expect(registrationPage.postalCodeField).toHaveValue(userData.postalCode);
    await expect(registrationPage.houseNumberField).toHaveValue(userData.houseNumber);
    await expect(registrationPage.streetField).toHaveValue(userData.street);
    await expect(registrationPage.cityField).toHaveValue(userData.city);
    await expect(registrationPage.stateField).toHaveValue(userData.state);
    await expect(registrationPage.phoneField).toHaveValue(userData.phone);
    await expect(registrationPage.emailAddressField).toHaveValue(userData.email);
    await expect(registrationPage.passwordField).toHaveValue(userData.password);

    await registrationPage.registerButton.click();
    await loginPage.login(userData.email, userData.password);

    await expect(page, 'Page URL should have expected path after login')
        .toHaveURL(expectedUrlAfterLogin);
    await expect(accountPage.pageTitle, 'Page title should have expected text after login')
        .toHaveText(accountPageText.title);
    await expect(accountPage.navBar.navMenuDropdown, 'Nav bar should show the user full name')
        .toHaveText(navBarText.userMenu(userData));
})
