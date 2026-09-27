import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

// ---------------------------------------------------------
// CONTACT US PAGE
// ---------------------------------------------------------

export class ContactUsPage extends BasePage {

    private readonly getInTouchHeading: Locator;
    private readonly nameInput: Locator;
    private readonly emailInput: Locator;
    private readonly subjectInput: Locator;
    private readonly messageInput: Locator;
    // The file input has no data-qa attribute, so target it by name.
    private readonly uploadFileInput: Locator;
    private readonly submitButton: Locator;
    private readonly successMessage: Locator;
    // The 'Home' button shown after the success alert (not the header nav link).
    private readonly homeButton: Locator;

    constructor(page: Page) {
        super(page, 'ContactUsPage');

        this.getInTouchHeading = page.getByRole('heading', { name: 'GET IN TOUCH' });
        this.nameInput = page.locator('input[name="name"]');
        this.emailInput = page.locator('input[name="email"]');
        this.subjectInput = page.locator('input[name="subject"]');
        this.messageInput = page.locator('textarea[name="message"]');
        this.uploadFileInput = page.locator('input[name="upload_file"]');
        this.submitButton = page.locator('input[name="submit"]');
        this.successMessage = page.locator('div.status.alert.alert-success');
        this.homeButton = page.locator('#form-section a:has-text("Home")');
    }

    // -------------------------------------------------
    // VERIFICATIONS
    // -------------------------------------------------

    async verifyGetInTouchHeadingVisible(): Promise<void> {
        this.log.info("Verifying 'GET IN TOUCH' is visible");
        await this.util.verifyVisible(this.getInTouchHeading);
    }

    async verifySuccessMessageVisible(): Promise<void> {
        this.log.info('Verifying the contact form success message is visible');
        await this.util.verifyVisible(this.successMessage);
    }

    // -------------------------------------------------
    // ACTIONS
    // -------------------------------------------------

    async fillContactForm(
        name: string,
        email: string,
        subject: string,
        message: string
    ): Promise<void> {
        this.log.info(`Filling the contact form for: ${email}`);
        await this.util.fill(this.nameInput, name);
        await this.util.fill(this.emailInput, email);
        await this.util.fill(this.subjectInput, subject);
        await this.util.fill(this.messageInput, message);
    }

    async uploadFile(filePath: string): Promise<void> {
        this.log.info(`Uploading file: ${filePath}`);
        await this.util.uploadFile(this.uploadFileInput, filePath);
    }

    async clickSubmit(): Promise<void> {
        this.log.info("Clicking 'Submit'");
        // Ad iframes/vignettes can overlap the button and intercept the click.
        await this.util.scrollIntoView(this.submitButton);
        await this.submitButton.click({ force: true });
    }

    /**
     * Submits the form and accepts the native confirmation dialog.
     * The dialog listener is registered before the click so the OK
     * button is never missed.
     */
    async submitAndAcceptDialog(): Promise<void> {
        this.log.info('Submitting the contact form and accepting the dialog');
        try {
            // Wait for the submit-handler script to finish loading, otherwise
            // the click falls through to a native submit and no dialog fires.
            await this.page.waitForLoadState('load');
            this.page.once('dialog', dialog => dialog.accept());
            await this.clickSubmit();
        } catch (error) {
            this.log.error(
                `Contact form submission failed: ${(error as Error).message}`
            );
            throw error;
        }
    }

    async clickHomeButton(): Promise<void> {
        this.log.info("Clicking 'Home' inside the success alert");
        await this.util.click(this.homeButton);
    }
}
