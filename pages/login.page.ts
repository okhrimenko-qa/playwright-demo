import { Locator, Page } from "@playwright/test";

export class LoginPage {
    readonly page: Page;
    readonly emailField: Locator;
    readonly passwordField: Locator;
    readonly loginButton: Locator;
    readonly loginForm: Locator;
    readonly loginError: Locator;

    constructor(page: Page) {
        this.page = page;
        this.loginForm = this.page.getByTestId('login-form');
        this.loginError = this.page.getByTestId('login-error');
        this.emailField = this.loginForm.getByTestId('email');
        this.passwordField = this.loginForm.getByTestId('password');
        this.loginButton = this.loginForm.getByTestId('login-submit');
    }

    async goto(): Promise<void> {
        await this.page.goto('/auth/login');
    }

    async login(username: string, password: string): Promise<void> {
        await this.emailField.fill(username);
        await this.passwordField.fill(password);
        await this.loginButton.click();
    }
}
