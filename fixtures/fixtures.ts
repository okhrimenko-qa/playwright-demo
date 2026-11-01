import { test as base, expect } from '@playwright/test';
import { ApiHelper } from '../helpers/apiHelper';
import { LoginPage } from '../pages/login.page';
import { UserData } from '../interfaces/UserData';
import { defaultToolshopApiUrl } from '../constants';
import commonHelper from '../helpers/commonHelper';

export interface Fixtures {
  apiHelper: ApiHelper;
  createNewUser: UserData;
  login: UserData;
}

export const test = base.extend<Fixtures>({
  apiHelper: async ({ playwright }, use) => {
    const apiURL = process.env.API_URL || defaultToolshopApiUrl;
    const request = await playwright.request.newContext({ baseURL: apiURL });

    await use(new ApiHelper(request));
    await request.dispose();
  },

  createNewUser: async ({ apiHelper }, use) => {
    const userData = commonHelper.generateNewUserData();
    const response = await apiHelper.register(userData);
    if (response.status() !== 201) {
      throw new Error(`Registering ${userData.email} failed: ${response.status()} ${await response.text()}`);
    }
    await use(userData);
  },

  login: async ({ page, createNewUser: userData }, use) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto();
    await expect(loginPage.emailField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();

    await loginPage.login(userData.email, userData.password);
    await expect(page).toHaveURL(/\/account$/);
    await expect(loginPage.loginForm).toBeHidden();
    await use(userData);
  }

});
