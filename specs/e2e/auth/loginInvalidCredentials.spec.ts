import { expect } from '@playwright/test';
import { test } from '../../../fixtures/fixtures';
import { LoginPage } from '../../../pages/login.page';
import commonHelper from '../../../helpers/commonHelper';
import testData from '../../../test-data/e2e/auth/loginInvalidCredentials';

test('Login form shows the same error for a wrong password and an unknown email @Tb74e1a6a @ui @auth @regression @P1', async ({
  page,
  createNewUser: userData,
}) => {
  const loginPage = new LoginPage(page);
  const { email: unknownEmail, password: wrongPassword } = commonHelper.generateNewUserData();
  const { loginPageText, expectedUrlAfterFailedLogin } = testData;

  await loginPage.goto();
  await loginPage.login(userData.email, wrongPassword);

  await expect(loginPage.loginError, 'Wrong password should show the generic error')
    .toHaveText(loginPageText.invalidCredentialsError);
  await expect(page, 'Login page should stay open after a wrong password')
    .toHaveURL(expectedUrlAfterFailedLogin);

  // Reload so the next assertion cannot pass on the error left from the previous attempt
  await loginPage.goto();
  await expect(loginPage.loginError).toBeHidden();
  await loginPage.login(unknownEmail, wrongPassword);

  await expect(loginPage.loginError, 'Unknown email should show the same generic error')
    .toHaveText(loginPageText.invalidCredentialsError);
  await expect(page, 'Login page should stay open after an unknown email')
    .toHaveURL(expectedUrlAfterFailedLogin);
});
