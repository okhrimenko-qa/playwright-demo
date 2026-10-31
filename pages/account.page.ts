import { Locator, Page } from "@playwright/test";
import { NavBar } from "./fragments/navBar.fragment";

export class AccountPage {
    public readonly pageTitle: Locator;
    public readonly navBar: NavBar;

    constructor(page: Page) {
        this.pageTitle = page.getByTestId('page-title');
        this.navBar = new NavBar(page);
    }
}
