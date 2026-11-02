import { Locator, Page } from "@playwright/test";
import { routes } from "../constants";

export class RegistrationPage {
    readonly page: Page;
    readonly root: Locator;
    readonly firstNameField: Locator;
    readonly lastNameField: Locator;
    readonly birthDateField: Locator;
    readonly countryDropdown: Locator;
    readonly postalCodeField: Locator;
    readonly houseNumberField: Locator;
    readonly streetField: Locator;
    readonly cityField: Locator;
    readonly stateField: Locator;
    readonly phoneField: Locator;
    readonly emailAddressField: Locator;
    readonly passwordField: Locator;
    readonly registerButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.root = this.page.locator('app-register');
        this.firstNameField = this.root.getByTestId('first-name');
        this.lastNameField = this.root.getByTestId('last-name');
        this.birthDateField = this.root.getByTestId('dob');
        this.countryDropdown = this.root.getByTestId('country');
        this.postalCodeField = this.root.getByTestId('postal_code');
        this.houseNumberField = this.root.getByTestId('house_number');
        this.streetField = this.root.getByTestId('street');
        this.cityField = this.root.getByTestId('city');
        this.stateField = this.root.getByTestId('state');
        this.phoneField = this.root.getByTestId('phone');
        this.emailAddressField = this.root.getByTestId('email');
        this.passwordField = this.root.getByTestId('password');
        this.registerButton = this.root.getByTestId('register-submit');
    }

    async goto() {
        await this.page.goto(routes.registration);
    }

    async selectCountry(country: string) {
        await this.countryDropdown.selectOption({ value: country });
    }
}
