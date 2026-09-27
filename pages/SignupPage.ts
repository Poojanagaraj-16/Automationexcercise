import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { RegistrationData } from '../utils/random-data-generator';

// ---------------------------------------------------------
// SIGNUP PAGE
// "ENTER ACCOUNT INFORMATION" step of registration
// ---------------------------------------------------------

export class SignupPage extends BasePage {

    // -------------------------------------------------
    // LOCATORS
    // -------------------------------------------------

    private readonly accountInfoHeading: Locator;
    private readonly createAccountButton: Locator;

    // The registration form fields expose no accessible role/label/testid,
    // so id selectors are the pragmatic choice here.
    private readonly titleMr: Locator;
    private readonly titleMrs: Locator;
    private readonly passwordInput: Locator;
    private readonly daysSelect: Locator;
    private readonly monthsSelect: Locator;
    private readonly yearsSelect: Locator;
    private readonly newsletterCheckbox: Locator;
    private readonly offersCheckbox: Locator;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly companyInput: Locator;
    private readonly addressInput: Locator;
    private readonly address2Input: Locator;
    private readonly countrySelect: Locator;
    private readonly stateInput: Locator;
    private readonly cityInput: Locator;
    private readonly zipcodeInput: Locator;
    private readonly mobileNumberInput: Locator;

    constructor(page: Page) {
        super(page, 'SignupPage');

        this.accountInfoHeading = page.getByRole('heading', { name: 'Enter Account Information' });
        this.createAccountButton = page.getByTestId('create-account');

        this.titleMr = page.locator('#id_gender1');
        this.titleMrs = page.locator('#id_gender2');
        this.passwordInput = page.locator('#password');
        this.daysSelect = page.locator('#days');
        this.monthsSelect = page.locator('#months');
        this.yearsSelect = page.locator('#years');
        this.newsletterCheckbox = page.locator('#newsletter');
        this.offersCheckbox = page.locator('#optin');
        this.firstNameInput = page.locator('#first_name');
        this.lastNameInput = page.locator('#last_name');
        this.companyInput = page.locator('#company');
        this.addressInput = page.locator('#address1');
        this.address2Input = page.locator('#address2');
        this.countrySelect = page.locator('#country');
        this.stateInput = page.locator('#state');
        this.cityInput = page.locator('#city');
        this.zipcodeInput = page.locator('#zipcode');
        this.mobileNumberInput = page.locator('#mobile_number');
    }

    // -------------------------------------------------
    // VERIFICATIONS
    // -------------------------------------------------

    async verifyAccountInfoVisible(): Promise<void> {
        this.log.info("Verifying 'ENTER ACCOUNT INFORMATION' is visible");
        await this.util.verifyVisible(this.accountInfoHeading);
    }

    // -------------------------------------------------
    // ACTIONS
    // -------------------------------------------------

    async selectTitle(title: 'Mr' | 'Mrs'): Promise<void> {
        this.log.info(`Selecting title: ${title}`);
        await this.util.check(title === 'Mr' ? this.titleMr : this.titleMrs);
    }

    async enterPassword(password: string): Promise<void> {
        this.log.info('Entering account password');
        await this.util.fill(this.passwordInput, password);
    }

    async selectDateOfBirth(day: string, month: string, year: string): Promise<void> {
        this.log.info(`Selecting date of birth: ${day}/${month}/${year}`);
        await this.util.selectByValue(this.daysSelect, day);
        await this.util.selectByValue(this.monthsSelect, month);
        await this.util.selectByValue(this.yearsSelect, year);
    }

    async checkNewsletter(): Promise<void> {
        this.log.info("Selecting 'Sign up for our newsletter!'");
        await this.util.check(this.newsletterCheckbox);
    }

    async checkSpecialOffers(): Promise<void> {
        this.log.info("Selecting 'Receive special offers from our partners!'");
        await this.util.check(this.offersCheckbox);
    }

    async fillAddressInformation(data: RegistrationData): Promise<void> {
        this.log.info('Filling address information');
        await this.util.fill(this.firstNameInput, data.firstName);
        await this.util.fill(this.lastNameInput, data.lastName);
        await this.util.fill(this.companyInput, data.company);
        await this.util.fill(this.addressInput, data.address);
        await this.util.fill(this.address2Input, data.address2);
        await this.util.selectByText(this.countrySelect, data.country);
        await this.util.fill(this.stateInput, data.state);
        await this.util.fill(this.cityInput, data.city);
        await this.util.fill(this.zipcodeInput, data.zipcode);
        await this.util.fill(this.mobileNumberInput, data.mobileNumber);
    }

    /**
     * Fills the whole "Enter Account Information" form.
     * Wrapped in try/catch so a single failing field is logged with
     * context before the original error is rethrown.
     */
    async fillAccountInformation(data: RegistrationData): Promise<void> {
        this.log.info(`Filling account information for: ${data.email}`);
        try {
            await this.selectTitle(data.title);
            await this.enterPassword(data.password);
            await this.selectDateOfBirth(
                data.dateOfBirth.day,
                data.dateOfBirth.month,
                data.dateOfBirth.year
            );
            await this.checkNewsletter();
            await this.checkSpecialOffers();
            await this.fillAddressInformation(data);
        } catch (error) {
            this.log.error(
                `Failed while filling account information for ${data.email}: ${(error as Error).message}`
            );
            throw error;
        }
    }

    async clickCreateAccount(): Promise<void> {
        this.log.info("Clicking 'Create Account'");
        await this.util.click(this.createAccountButton);
    }
}
