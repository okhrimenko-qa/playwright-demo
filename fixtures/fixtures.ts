import { test as base, expect } from '@playwright/test';
import { ApiHelper } from '../helpers/apiHelper';
import { LoginPage } from '../pages/login.page';
import { UserData } from '../interfaces/UserData';
import { LoggedInUser } from '../interfaces/LoggedInUser';
import { InvoiceResponse } from '../interfaces/api/InvoiceResponse';
import { defaultToolshopApiUrl } from '../constants';
import commonHelper from '../helpers/commonHelper';

export interface Fixtures {
  apiHelper: ApiHelper;
  createNewUser: UserData;
  login: UserData;
  createLoggedInUser: () => Promise<LoggedInUser>;
  createInvoice: (user: LoggedInUser) => Promise<InvoiceResponse>;
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
    const response = await apiHelper.user.register(userData);
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
  },

  createLoggedInUser: async ({ apiHelper }, use) => {
    await use(async () => {
      const userData = commonHelper.generateNewUserData();
      const registerResponse = await apiHelper.user.register(userData);
      if (registerResponse.status() !== 201) {
        throw new Error(`Registering ${userData.email} failed: ${registerResponse.status()} ${await registerResponse.text()}`);
      }
      const tokenResponse = await apiHelper.user.getToken(userData.email, userData.password);
      if (tokenResponse.status() !== 200) {
        throw new Error(`Logging in ${userData.email} failed: ${tokenResponse.status()} ${await tokenResponse.text()}`);
      }
      const { id } = await registerResponse.json();
      const { access_token: token } = await tokenResponse.json();

      return { ...userData, id, token };
    });
  },

  createInvoice: async ({ apiHelper }, use) => {
    await use(async (user) => {
      const { data: [product] } = await (await apiHelper.product.getAll()).json();
      const { id: cartId } = await (await apiHelper.cart.create()).json();
      await apiHelper.cart.addItem(cartId, product.id, 1);

      const lookupResponse = await apiHelper.postcode.lookup(user.country, user.postalCode);
      const { street, city, state } = await lookupResponse.json();
      const response = await apiHelper.invoice.create({
        billing_street: street,
        billing_city: city,
        billing_state: state,
        billing_country: user.country,
        billing_postal_code: user.postalCode,
        payment_method: 'cash-on-delivery',
        payment_details: {},
        cart_id: cartId,
      }, user.token);
      if (response.status() !== 201) {
        throw new Error(`Creating an invoice failed: ${response.status()} ${await response.text()}`);
      }

      return response.json();
    });
  },

});
