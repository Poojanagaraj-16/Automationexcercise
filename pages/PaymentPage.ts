import { expect, Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { BasePage } from './BasePage';
import type { PaymentData } from '../utils/random-data-generator';

// ---------------------------------------------------------
// PAYMENT PAGE
// ---------------------------------------------------------

export class PaymentPage extends BasePage {

    private readonly nameOnCardInput: Locator;
    private readonly cardNumberInput: Locator;
    private readonly cvcInput: Locator;
    private readonly expiryMonthInput: Locator;
    private readonly expiryYearInput: Locator;
    private readonly payAndConfirmButton: Locator;
    private readonly orderPlacedHeading: Locator;
    private readonly orderConfirmedMessage: Locator;
    private readonly downloadInvoiceButton: Locator;
    private readonly continueButton: Locator;

    constructor(page: Page) {
        super(page, 'PaymentPage');

        this.nameOnCardInput = page.getByTestId('name-on-card');
        this.cardNumberInput = page.getByTestId('card-number');
        this.cvcInput = page.getByTestId('cvc');
        this.expiryMonthInput = page.getByTestId('expiry-month');
        this.expiryYearInput = page.getByTestId('expiry-year');
        this.payAndConfirmButton = page.getByTestId('pay-button');
        this.orderPlacedHeading = page.getByRole('heading', { name: 'Order Placed!' });
        this.orderConfirmedMessage = page.getByText('Congratulations! Your order has been confirmed!');
        this.downloadInvoiceButton = page.locator('a[href^="/download_invoice/"]');
        this.continueButton = page.getByTestId('continue-button');
    }

    // -------------------------------------------------
    // VERIFICATIONS
    // -------------------------------------------------

    async verifyPaymentPageVisible(): Promise<void> {
        this.log.info('Verifying the payment page is visible');
        await this.util.verifyVisible(this.nameOnCardInput);
    }

    async verifyOrderPlacedSuccessfully(): Promise<void> {
        this.log.info('Verifying the order placed confirmation is visible');
        await this.util.verifyVisible(this.orderPlacedHeading);
        await this.util.verifyVisible(this.orderConfirmedMessage);
    }

    // -------------------------------------------------
    // ACTIONS
    // -------------------------------------------------

    async fillPaymentDetails(data: PaymentData): Promise<void> {
        this.log.info('Filling the payment details');
        await this.util.fill(this.nameOnCardInput, data.nameOnCard);
        await this.util.fill(this.cardNumberInput, data.cardNumber);
        await this.util.fill(this.cvcInput, data.cvc);
        await this.util.fill(this.expiryMonthInput, data.expiryMonth);
        await this.util.fill(this.expiryYearInput, data.expiryYear);
    }

    async clickPayAndConfirmOrder(): Promise<void> {
        this.log.info("Clicking 'Pay and Confirm Order'");
        await this.util.click(this.payAndConfirmButton);
    }

    /**
     * Clicks 'Download Invoice' and validates the resulting file:
     *  - the download starts,
     *  - the file is written to disk,
     *  - the file is non-empty.
     * Returns the suggested file name.
     */
    async downloadInvoice(): Promise<string> {

        this.log.info("Clicking 'Download Invoice' and capturing the download");

        try {
            const [download] = await Promise.all([
                this.page.waitForEvent('download'),
                this.util.click(this.downloadInvoiceButton)
            ]);

            const fileName = download.suggestedFilename();

            const downloadDir = path.resolve('custom-report', 'invoices');
            fs.mkdirSync(downloadDir, { recursive: true });

            const savedPath = path.join(downloadDir, fileName);
            await download.saveAs(savedPath);

            const { size } = fs.statSync(savedPath);
            expect(size, `Downloaded invoice '${fileName}' should not be empty`).toBeGreaterThan(0);

            this.log.info(`Invoice downloaded successfully: ${fileName} (${size} bytes)`);
            return fileName;
        } catch (error) {
            this.log.error(`Invoice download failed: ${(error as Error).message}`);
            throw error;
        }
    }

    async clickContinue(): Promise<void> {
        this.log.info("Clicking 'Continue'");
        await this.util.click(this.continueButton);
    }
}
