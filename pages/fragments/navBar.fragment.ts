import { Locator, Page } from "@playwright/test";

export class NavBar {
    readonly page: Page;
    readonly root: Locator;
    readonly navMenuDropdown: Locator;

    constructor(page: Page) {
        this.page = page;
        this.root = this.page.locator('app-header nav');
        this.navMenuDropdown = this.root.getByTestId('nav-menu');
    }
}
