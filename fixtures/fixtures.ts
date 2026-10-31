import { test as base, expect } from '@playwright/test';
import { ApiHelper } from '../helpers/apiHelper';
import { generateNewUserData } from '../helpers/commonHelper';
import { LoginPage } from '../pages/login.page';
import { UserData } from '../interfaces/UserData';
import { defaultToolshopApiUrl } from '../constants';

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
    const user = generateNewUserData();
    const response = await apiHelper.register(user);
    if (response.status() !== 201) {
      throw new Error(`Registering ${user.email} failed: ${response.status()} ${await response.text()}`);
    }
    await use(user);
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
