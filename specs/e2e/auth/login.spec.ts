import { expect } from '@playwright/test';
import { test } from '../../../fixtures/fixtures';
import { LoginPage } from '../../../pages/login.page';
import { AccountPage } from '../../../pages/account.page';
import testData from '../../../test-data/e2e/auth/login';

test('Customer logs in with valid credentials via the login form @Ta8031e0b @ui @auth @regression @smoke @P1', async ({
  page,
  createNewUser: userData,
}) => {
  const loginPage = new LoginPage(page);
  const accountPage = new AccountPage(page);
  const {
    expectedPageTitle,
    expectedUrlAfterLogin,
    getExpectedNavBarText,
  } = testData;

  await loginPage.goto();

  await expect(loginPage.emailField).toBeVisible();
  await expect(loginPage.passwordField).toBeVisible();

  await loginPage.login(userData.email, userData.password);

  await expect(loginPage.loginForm, 'Login form should disappear after login')
    .toBeHidden();
  await expect(page, 'Page URL should have expected path after login')
    .toHaveURL(expectedUrlAfterLogin);
  await expect(accountPage.pageTitle, 'Page title should have expected text after login')
    .toHaveText(expectedPageTitle);
  await expect(accountPage.navBar.navMenuDropdown, 'Nav bar should show the user full name')
    .toHaveText(getExpectedNavBarText(userData));
});
