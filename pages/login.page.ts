import { Locator, Page } from "@playwright/test";

export class LoginPage {
    public readonly page: Page;
    public readonly emailField: Locator;
    public readonly passwordField: Locator;
    public readonly loginButton: Locator;
    public readonly loginForm: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailField = page.getByTestId('email');
        this.passwordField = page.getByTestId('password');
        this.loginButton = page.getByTestId('login-submit');
        this.loginForm = page.getByTestId('login-form');
    }

    public async goto(): Promise<void> {
        await this.page.goto('/auth/login');
    }

    public async login(username: string, password: string): Promise<void> {
        await this.emailField.fill(username);
        await this.passwordField.fill(password);
        await this.loginButton.click();
    }

    public async isEmailFieldVisible(): Promise<boolean> {
        return await this.emailField.isVisible();
    }
}
