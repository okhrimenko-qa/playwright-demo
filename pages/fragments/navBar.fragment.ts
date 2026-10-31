import { Locator, Page } from "@playwright/test";

export class NavBar {
    public readonly root: Locator;
    public readonly navMenuDropdown: Locator;

    constructor(page: Page) {
        this.root = page.locator('app-header nav');
        this.navMenuDropdown = this.root.getByTestId('nav-menu');
    }
}