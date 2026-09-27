import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

// ---------------------------------------------------------
// HOME PAGE
// ---------------------------------------------------------

export class HomePage extends BasePage {

    // -------------------------------------------------
    // LOCATORS
    // -------------------------------------------------

    private readonly logo: Locator;
    private readonly featuresItems: Locator;
    private readonly firstProductViewLink: Locator;

    private readonly signupLoginLink: Locator;
    private readonly contactUsLink: Locator;
    private readonly testCasesLink: Locator;
    private readonly productsLink: Locator;
    private readonly cartLink: Locator;

    // Footer subscription
    private readonly footer: Locator;
    private readonly subscriptionHeading: Locator;
    private readonly subscribeEmailInput: Locator;
    private readonly subscribeButton: Locator;
    private readonly subscribeSuccessMessage: Locator;

    // Recommended items
    private readonly recommendedItemsSection: Locator;
    private readonly recommendedItemsHeading: Locator;
    private readonly recommendedActiveItem: Locator;
    private readonly cartModal: Locator;

    // Scroll up
    private readonly scrollUpButton: Locator;
    private readonly heroHeading: Locator;

    constructor(page: Page) {
        super(page, 'HomePage');

        this.logo = page.locator('.logo img[src*="logo"]');
        this.featuresItems = page.locator('.features_items');
        this.firstProductViewLink = page
            .locator('.features_items a[href*="/product_details/"]')
            .first();

        this.signupLoginLink = page.getByRole('link', { name: 'Signup / Login' });
        this.contactUsLink = page.getByRole('link', { name: 'Contact Us' });
        this.testCasesLink = page.getByRole('link', { name: 'Test Cases', exact: true });
        this.productsLink = page.getByRole('link', { name: 'Products' });
        this.cartLink = page.locator('.shop-menu a[href="/view_cart"]');

        this.footer = page.locator('#footer');
        // The DOM heading reads "Subscription" but is upper-cased by CSS.
        this.subscriptionHeading = this.footer.getByText('SUBSCRIPTION');
        this.subscribeEmailInput = page.locator('#susbscribe_email');
        this.subscribeButton = page.locator('#subscribe');
        this.subscribeSuccessMessage = page.locator('#success-subscribe .alert-success');

        // Recommended products live in a rotating carousel — scope to the active slide.
        this.recommendedItemsSection = page.locator('.recommended_items');
        this.recommendedItemsHeading = page.locator('.recommended_items h2.title');
        this.recommendedActiveItem = this.recommendedItemsSection.locator('.item.active');
        this.cartModal = page.locator('#cartModal');

        // The scroll-up arrow is injected by the jQuery scrollUp plugin.
        this.scrollUpButton = page.locator('#scrollUp');
        this.heroHeading = page.getByRole('heading', {
            name: 'Full-Fledged practice website for Automation Engineers',
            exact: true
        });
    }

    // -------------------------------------------------
    // NAVIGATION ACTIONS
    // -------------------------------------------------

    async verifyHomePageVisible(): Promise<void> {
        this.log.info('Verifying the home page is visible');
        await this.util.verifyVisible(this.logo);
        await this.util.verifyVisible(this.featuresItems);
    }

    async clickSignupLogin(): Promise<void> {
        this.log.info("Clicking 'Signup / Login'");
        await this.util.click(this.signupLoginLink);
    }

    async clickContactUs(): Promise<void> {
        this.log.info("Clicking 'Contact Us'");
        await this.util.click(this.contactUsLink);
    }

    async clickTestCases(): Promise<void> {
        this.log.info("Clicking 'Test Cases'");
        await this.util.click(this.testCasesLink);
    }

    async clickProducts(): Promise<void> {
        this.log.info("Clicking 'Products'");
        await this.util.click(this.productsLink);
    }

    async clickCart(): Promise<void> {
        this.log.info("Clicking 'Cart'");
        await this.util.click(this.cartLink);
    }

    async clickViewProductOfFirstProduct(): Promise<void> {
        this.log.info("Clicking 'View Product' of the first product");
        await this.util.click(this.firstProductViewLink);
    }

    // -------------------------------------------------
    // FOOTER SUBSCRIPTION
    // -------------------------------------------------

    async scrollToFooter(): Promise<void> {
        this.log.info('Scrolling down to the footer');
        await this.util.scrollIntoView(this.footer);
    }

    async verifySubscriptionHeadingVisible(): Promise<void> {
        this.log.info("Verifying 'SUBSCRIPTION' is visible");
        await this.util.verifyVisible(this.subscriptionHeading);
    }

    async subscribeWithEmail(email: string): Promise<void> {
        this.log.info(`Subscribing with email: ${email}`);
        // Wait for subscription.js to bind its submit handler.
        await this.page.waitForLoadState('load');
        await this.util.fill(this.subscribeEmailInput, email);
        await this.util.click(this.subscribeButton);
    }

    async verifySubscriptionSuccessMessageVisible(): Promise<void> {
        this.log.info('Verifying the subscription success message is visible');
        await this.util.verifyVisible(this.subscribeSuccessMessage);
    }

    // -------------------------------------------------
    // RECOMMENDED ITEMS
    // -------------------------------------------------

    async scrollToRecommendedItems(): Promise<void> {
        this.log.info("Scrolling down to the 'RECOMMENDED ITEMS' section");
        await this.util.scrollIntoView(this.recommendedItemsSection);
    }

    async verifyRecommendedItemsVisible(): Promise<void> {
        this.log.info("Verifying 'RECOMMENDED ITEMS' are visible");
        await this.util.verifyVisible(this.recommendedItemsHeading);
    }

    async addRecommendedProductToCart(index = 0): Promise<string> {
        this.log.info(`Adding the recommended product at index ${index} to the cart`);

        const wrapper = this.recommendedActiveItem
            .locator('.product-image-wrapper')
            .nth(index);

        await this.util.scrollIntoView(wrapper);
        // Hovering pauses the carousel so the slide cannot rotate between
        // reading the product name and clicking 'Add to cart'.
        await this.util.hover(wrapper);

        const name = await this.util.getInnerText(
            wrapper.locator('.productinfo p')
        );

        await this.util.click(wrapper.locator('.productinfo a.add-to-cart'));

        return name;
    }

    async clickViewCartFromModal(): Promise<void> {
        this.log.info("Clicking 'View Cart' from the confirmation modal");
        await this.util.click(this.cartModal.locator('a[href="/view_cart"]'));
    }

    // -------------------------------------------------
    // SCROLL UP / DOWN
    // -------------------------------------------------

    async scrollToBottomOfPage(): Promise<void> {
        this.log.info('Scrolling down to the bottom of the page');
        await this.util.scrollToBottom();
    }

    async scrollToTopOfPage(): Promise<void> {
        this.log.info('Scrolling up to the top of the page');
        await this.util.scrollToTop();
    }

    async clickScrollUpArrow(): Promise<void> {
        this.log.info('Clicking the scroll-up arrow at the bottom right');
        await this.util.verifyVisible(this.scrollUpButton);
        await this.util.click(this.scrollUpButton);
    }

    async verifyPageScrolledToTop(): Promise<void> {
        this.log.info('Verifying the page is scrolled back to the top');
        await expect
            .poll(() => this.page.evaluate(() => window.scrollY), { timeout: 5000 })
            .toBe(0);
    }

    async verifyHeroHeadingVisible(): Promise<void> {
        this.log.info("Verifying the hero heading text is visible");
        await this.util.verifyVisible(this.heroHeading);
    }
}
