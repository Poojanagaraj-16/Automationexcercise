import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

// ---------------------------------------------------------
// PRODUCT DETAILS PAGE
// ---------------------------------------------------------

export class ProductDetailsPage extends BasePage {

    private readonly productInformation: Locator;
    private readonly productName: Locator;
    private readonly productCategory: Locator;
    private readonly productPrice: Locator;
    private readonly productAvailability: Locator;
    private readonly productCondition: Locator;
    private readonly productBrand: Locator;
    private readonly quantityInput: Locator;
    private readonly addToCartButton: Locator;
    private readonly cartModal: Locator;
    private readonly viewCartLink: Locator;

    private readonly writeYourReviewTab: Locator;
    private readonly reviewNameInput: Locator;
    private readonly reviewEmailInput: Locator;
    private readonly reviewTextarea: Locator;
    private readonly reviewSubmitButton: Locator;
    private readonly reviewSuccessMessage: Locator;

    constructor(page: Page) {
        super(page, 'ProductDetailsPage');

        this.productInformation = page.locator('.product-information');
        this.productName = this.productInformation.locator('h2');
        this.productCategory = this.productInformation.locator('p', { hasText: 'Category:' });
        this.productPrice = this.productInformation.locator('span span');
        this.productAvailability = this.productInformation.locator('p', { hasText: 'Availability:' });
        this.productCondition = this.productInformation.locator('p', { hasText: 'Condition:' });
        this.productBrand = this.productInformation.locator('p', { hasText: 'Brand:' });
        this.quantityInput = this.productInformation.locator('#quantity');
        this.addToCartButton = this.productInformation.locator('button.cart');
        this.cartModal = page.locator('#cartModal');
        this.viewCartLink = this.cartModal.getByRole('link', { name: 'View Cart' });

        // 'Write Your Review' is already the active pane on this page.
        this.writeYourReviewTab = page.locator('a[href="#reviews"]');
        this.reviewNameInput = page.locator('#name');
        this.reviewEmailInput = page.locator('#email');
        this.reviewTextarea = page.locator('#review');
        this.reviewSubmitButton = page.locator('#button-review');
        this.reviewSuccessMessage = page.locator('#review-section .alert-success');
    }

    // -------------------------------------------------
    // VERIFICATIONS
    // -------------------------------------------------

    async verifyProductDetailOpen(): Promise<void> {
        this.log.info('Verifying the product detail page is open');
        await this.util.verifyVisible(this.productInformation);
        await this.util.verifyVisible(this.productName);
    }

    async verifyProductDetailsVisible(): Promise<void> {
        this.log.info('Verifying product name, category, price, availability, condition and brand');
        await this.util.verifyVisible(this.productName);
        await this.util.verifyVisible(this.productCategory);
        await this.util.verifyVisible(this.productPrice);
        await this.util.verifyVisible(this.productAvailability);
        await this.util.verifyVisible(this.productCondition);
        await this.util.verifyVisible(this.productBrand);
    }

    async verifyWriteYourReviewVisible(): Promise<void> {
        this.log.info("Verifying 'Write Your Review' is visible");
        await this.util.verifyVisible(this.writeYourReviewTab);
    }

    async verifyReviewSuccessMessageVisible(): Promise<void> {
        this.log.info("Verifying 'Thank you for your review.' is visible");
        await this.util.verifyVisible(this.reviewSuccessMessage);
    }

    // -------------------------------------------------
    // ACTIONS
    // -------------------------------------------------

    async setQuantity(quantity: number): Promise<void> {
        this.log.info(`Setting the product quantity to ${quantity}`);
        await this.util.clearAndFill(this.quantityInput, String(quantity));
    }

    async addToCart(): Promise<void> {
        this.log.info("Clicking 'Add to cart'");
        await this.page.waitForLoadState('load');
        await this.util.click(this.addToCartButton);
        await this.util.verifyVisible(this.cartModal);
    }

    async clickViewCart(): Promise<void> {
        this.log.info("Clicking 'View Cart'");
        await this.util.click(this.viewCartLink);
    }

    // Review form
    async fillReview(name: string, email: string, review: string): Promise<void> {
        this.log.info(`Entering review details for: ${name} / ${email}`);
        await this.util.fill(this.reviewNameInput, name);
        await this.util.fill(this.reviewEmailInput, email);
        await this.util.fill(this.reviewTextarea, review);
    }

    async clickSubmitReview(): Promise<void> {
        this.log.info("Clicking 'Submit' on the review form");
        // The submit handler is bound by review.js — wait for load first.
        await this.page.waitForLoadState('load');
        await this.util.click(this.reviewSubmitButton);
    }
}
