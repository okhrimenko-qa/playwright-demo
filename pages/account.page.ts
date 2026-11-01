import { Locator, Page } from "@playwright/test";
import { NavBar } from "./fragments/navBar.fragment";

export class AccountPage {
    readonly page: Page;
    readonly pageTitle: Locator;
    readonly navBar: NavBar;

    constructor(page: Page) {
        this.page = page;
        this.pageTitle = this.page.getByTestId('page-title');
        this.navBar = new NavBar(this.page);
    }
}
