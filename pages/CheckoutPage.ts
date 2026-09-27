import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { RegistrationData } from '../utils/random-data-generator';

// ---------------------------------------------------------
// CHECKOUT PAGE
// ---------------------------------------------------------

export class CheckoutPage extends BasePage {

    private readonly addressDetailsHeading: Locator;
    private readonly reviewOrderHeading: Locator;
    private readonly deliveryAddress: Locator;
    private readonly invoiceAddress: Locator;
    private readonly orderTable: Locator;
    private readonly orderRows: Locator;
    private readonly commentTextarea: Locator;
    private readonly placeOrderButton: Locator;

    constructor(page: Page) {
        super(page, 'CheckoutPage');

        this.addressDetailsHeading = page.getByRole('heading', { name: 'Address Details' });
        this.reviewOrderHeading = page.getByRole('heading', { name: 'Review Your Order' });
        this.deliveryAddress = page.locator('#address_delivery');
        this.invoiceAddress = page.locator('#address_invoice');
        this.orderTable = page.locator('#cart_info');
        this.orderRows = this.orderTable.locator('tbody tr');
        this.commentTextarea = page.locator('textarea[name="message"]');
        this.placeOrderButton = page.getByRole('link', { name: 'Place Order' });
    }

    // -------------------------------------------------
    // VERIFICATIONS
    // -------------------------------------------------

    async verifyCheckoutPageVisible(): Promise<void> {
        this.log.info('Verifying the checkout page is visible');
        await this.util.verifyVisible(this.addressDetailsHeading);
        await this.util.verifyVisible(this.reviewOrderHeading);
        await this.util.verifyVisible(this.orderTable);
    }

    async verifyAddressDetails(): Promise<void> {
        this.log.info('Verifying the delivery and billing address blocks are visible');
        await this.util.verifyVisible(this.deliveryAddress);
        await this.util.verifyVisible(this.invoiceAddress);
    }

    async verifyReviewOrder(): Promise<void> {
        this.log.info('Verifying the order review table is visible');
        await this.util.verifyVisible(this.orderRows.first());
    }

    async verifyDeliveryAddressMatchesSignup(data: RegistrationData): Promise<void> {
        this.log.info('Verifying the delivery address matches the signup details');
        await this.verifyAddressBlock(this.deliveryAddress, data);
    }

    async verifyBillingAddressMatchesSignup(data: RegistrationData): Promise<void> {
        this.log.info('Verifying the billing address matches the signup details');
        await this.verifyAddressBlock(this.invoiceAddress, data);
    }

    async verifyDeliveryAndBillingAddressesAreSame(): Promise<void> {
        this.log.info('Verifying the delivery and billing addresses are identical');
        const delivery = await this.util.getAllTexts(
            this.deliveryAddress.locator('li:not(.address_title)')
        );
        const billing = await this.util.getAllTexts(
            this.invoiceAddress.locator('li:not(.address_title)')
        );
        expect(billing).toEqual(delivery);
    }

    private async verifyAddressBlock(block: Locator, data: RegistrationData): Promise<void> {
        const text = await this.util.getInnerText(block);
        const expectedParts = [
            data.firstName,
            data.lastName,
            data.company,
            data.address,
            data.address2,
            data.city,
            data.state,
            data.zipcode,
            data.country,
            data.mobileNumber
        ];
        for (const part of expectedParts) {
            expect(text).toContain(part);
        }
    }

    // -------------------------------------------------
    // ACTIONS
    // -------------------------------------------------

    async enterComment(comment: string): Promise<void> {
        this.log.info('Entering the order comment');
        await this.util.fill(this.commentTextarea, comment);
    }

    async clickPlaceOrder(): Promise<void> {
        this.log.info("Clicking 'Place Order'");
        await this.util.click(this.placeOrderButton);
    }
}
