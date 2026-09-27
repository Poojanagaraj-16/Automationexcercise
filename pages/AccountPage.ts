import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

// ---------------------------------------------------------
// ACCOUNT PAGE
// Shared account state: Account Created / Logged in header /
// Account Deleted / Logout
// ---------------------------------------------------------

export class AccountPage extends BasePage {

    // -------------------------------------------------
    // LOCATORS
    // -------------------------------------------------

    private readonly accountCreatedHeading: Locator;
    private readonly accountDeletedHeading: Locator;
    private readonly continueButton: Locator;
    private readonly loggedInAsText: Locator;
    private readonly deleteAccountLink: Locator;
    private readonly logoutLink: Locator;

    constructor(page: Page) {
        super(page, 'AccountPage');

        this.accountCreatedHeading = page.getByTestId('account-created');
        this.accountDeletedHeading = page.getByTestId('account-deleted');
        this.continueButton = page.getByTestId('continue-button');
        // These nav items do not expose a matching accessible name on this
        // site, so attribute/text-based locators are used instead.
        this.loggedInAsText = page.locator('a:has-text("Logged in as")');
        this.deleteAccountLink = page.locator('a[href="/delete_account"]');
        this.logoutLink = page.locator('a[href="/logout"]');
    }

    // -------------------------------------------------
    // VERIFICATIONS
    // -------------------------------------------------

    async verifyAccountCreated(): Promise<void> {
        this.log.info("Verifying 'ACCOUNT CREATED!' is visible");
        await this.util.verifyVisible(this.accountCreatedHeading);
    }

    async verifyAccountDeleted(): Promise<void> {
        this.log.info("Verifying 'ACCOUNT DELETED!' is visible");
        await this.util.verifyVisible(this.accountDeletedHeading);
    }

    async verifyLoggedInAs(username: string): Promise<void> {
        this.log.info(`Verifying 'Logged in as ${username}'`);
        await this.util.verifyVisible(this.loggedInAsText);
        await this.util.verifyText(this.loggedInAsText, username);
    }

    // -------------------------------------------------
    // ACTIONS
    // -------------------------------------------------

    async clickContinue(): Promise<void> {
        this.log.info("Clicking 'Continue'");
        await this.util.click(this.continueButton);
    }

    async clickDeleteAccount(): Promise<void> {
        this.log.info("Clicking 'Delete Account'");
        await this.util.click(this.deleteAccountLink);
    }

    async clickLogout(): Promise<void> {
        this.log.info("Clicking 'Logout'");
        await this.util.click(this.logoutLink);
    }
}
