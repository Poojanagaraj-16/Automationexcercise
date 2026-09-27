import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

// ---------------------------------------------------------
// CART PAGE
// ---------------------------------------------------------

export class CartPage extends BasePage {

    private readonly cartTable: Locator;
    private readonly cartRows: Locator;
    private readonly cartProductNames: Locator;
    private readonly cartProductPrices: Locator;
    private readonly cartProductQuantities: Locator;
    private readonly cartProductTotals: Locator;
    private readonly removeButtons: Locator;
    private readonly emptyCart: Locator;
    private readonly proceedToCheckoutButton: Locator;
    private readonly checkoutModal: Locator;
    private readonly registerLoginLink: Locator;
    private readonly continueOnCartButton: Locator;

    // Footer subscription
    private readonly footer: Locator;
    private readonly subscriptionHeading: Locator;
    private readonly subscribeEmailInput: Locator;
    private readonly subscribeButton: Locator;
    private readonly subscribeSuccessMessage: Locator;

    constructor(page: Page) {
        super(page, 'CartPage');

        this.cartTable = page.locator('#cart_info');
        this.cartRows = page.locator('#cart_info tbody tr');
        this.cartProductNames = this.cartRows.locator('.cart_description h4 a');
        this.cartProductPrices = this.cartRows.locator('.cart_price p');
        this.cartProductQuantities = this.cartRows.locator('.cart_quantity');
        this.cartProductTotals = this.cartRows.locator('.cart_total_price');
        this.removeButtons = this.cartRows.locator('.cart_quantity_delete');
        this.emptyCart = page.locator('#empty_cart');
        this.proceedToCheckoutButton = page.locator('a.check_out', { hasText: 'Proceed To Checkout' });
        this.checkoutModal = page.locator('#checkoutModal');
        this.registerLoginLink = this.checkoutModal.locator('a[href="/login"]');
        this.continueOnCartButton = this.checkoutModal.locator('.close-checkout-modal');

        this.footer = page.locator('#footer');
        this.subscriptionHeading = this.footer.getByText('SUBSCRIPTION');
        this.subscribeEmailInput = page.locator('#susbscribe_email');
        this.subscribeButton = page.locator('#subscribe');
        this.subscribeSuccessMessage = page.locator('#success-subscribe .alert-success');
    }

    // -------------------------------------------------
    // VERIFICATIONS
    // -------------------------------------------------

    async verifyCartPageVisible(): Promise<void> {
        this.log.info('Verifying the cart page is visible');
        await this.util.verifyVisible(this.cartTable);
    }

    async verifyCartEmpty(): Promise<void> {
        this.log.info('Verifying the cart is empty');
        await this.util.verifyVisible(this.emptyCart);
    }

    async verifyCheckoutModalVisible(): Promise<void> {
        this.log.info('Verifying the checkout login prompt modal is visible');
        await this.util.verifyVisible(this.checkoutModal);
    }

    async verifyCartProductQuantity(expectedQuantity: string): Promise<void> {
        this.log.info(`Verifying the cart quantity is ${expectedQuantity}`);
        await this.util.verifyText(this.cartProductQuantities.first(), expectedQuantity);
    }

    async verifySubscriptionHeadingVisible(): Promise<void> {
        this.log.info("Verifying 'SUBSCRIPTION' is visible");
        await this.util.verifyVisible(this.subscriptionHeading);
    }

    async verifySubscriptionSuccessMessageVisible(): Promise<void> {
        this.log.info('Verifying the subscription success message is visible');
        await this.util.verifyVisible(this.subscribeSuccessMessage);
    }

    // -------------------------------------------------
    // READERS
    // -------------------------------------------------

    async getCartItemCount(): Promise<number> {
        this.log.info('Reading the number of products in the cart');
        return this.util.count(this.cartRows);
    }

    async getCartProductNames(): Promise<string[]> {
        this.log.info('Reading the cart product names');
        return this.util.getAllTexts(this.cartProductNames);
    }

    async getCartProductPrices(): Promise<string[]> {
        this.log.info('Reading the cart product prices');
        return this.util.getAllTexts(this.cartProductPrices);
    }

    async getCartProductQuantities(): Promise<string[]> {
        this.log.info('Reading the cart product quantities');
        return this.util.getAllTexts(this.cartProductQuantities);
    }

    async getCartProductTotals(): Promise<string[]> {
        this.log.info('Reading the cart product totals');
        return this.util.getAllTexts(this.cartProductTotals);
    }

    // -------------------------------------------------
    // ACTIONS
    // -------------------------------------------------

    async removeProduct(index = 0): Promise<void> {
        this.log.info(`Removing the cart product at index ${index}`);
        await this.page.waitForLoadState('load');
        await this.util.click(this.removeButtons.nth(index));
    }

    async clickProceedToCheckout(): Promise<void> {
        this.log.info("Clicking 'Proceed To Checkout'");
        await this.page.waitForLoadState('load');
        await this.util.click(this.proceedToCheckoutButton);
    }

    async clickRegisterLoginFromModal(): Promise<void> {
        this.log.info("Clicking 'Register / Login' in the checkout modal");
        await this.util.click(this.registerLoginLink);
    }

    async clickContinueOnCart(): Promise<void> {
        this.log.info("Clicking 'Continue On Cart'");
        await this.util.click(this.continueOnCartButton);
    }

    // Footer subscription
    async scrollToFooter(): Promise<void> {
        this.log.info('Scrolling down to the footer');
        await this.util.scrollIntoView(this.footer);
    }

    async subscribeWithEmail(email: string): Promise<void> {
        this.log.info(`Subscribing with email: ${email}`);
        await this.page.waitForLoadState('load');
        await this.util.fill(this.subscribeEmailInput, email);
        await this.util.click(this.subscribeButton);
    }
}
