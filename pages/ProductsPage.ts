import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

// ---------------------------------------------------------
// PRODUCTS PAGE
// ---------------------------------------------------------

export class ProductsPage extends BasePage {

    private readonly allProductsHeading: Locator;
    private readonly productList: Locator;
    private readonly firstProductViewLink: Locator;
    private readonly searchInput: Locator;
    private readonly searchButton: Locator;
    private readonly searchedProductsHeading: Locator;
    private readonly cartModal: Locator;
    private readonly continueShoppingButton: Locator;
    private readonly viewCartLink: Locator;

    constructor(page: Page) {
        super(page, 'ProductsPage');

        this.allProductsHeading = page.getByRole('heading', { name: 'All Products', exact: true });
        this.productList = page.locator('.product-image-wrapper');
        this.firstProductViewLink = this.productList.first().locator('a:has-text("View Product")');
        this.searchInput = page.locator('#search_product');
        this.searchButton = page.locator('#submit_search');
        this.searchedProductsHeading = page.getByRole('heading', { name: 'Searched Products', exact: true });
        this.cartModal = page.locator('#cartModal');
        this.continueShoppingButton = this.cartModal.locator('.close-modal');
        this.viewCartLink = this.cartModal.locator('a[href="/view_cart"]');
    }

    // -------------------------------------------------
    // VERIFICATIONS
    // -------------------------------------------------

    async verifyAllProductsPageVisible(): Promise<void> {
        this.log.info("Verifying the 'ALL PRODUCTS' page is visible");
        await this.util.verifyVisible(this.allProductsHeading);
    }

    async verifyProductListVisible(): Promise<void> {
        this.log.info('Verifying the product list is visible');
        await this.util.verifyVisible(this.productList.first());
    }

    async verifySearchedProductsHeadingVisible(): Promise<void> {
        this.log.info("Verifying the 'SEARCHED PRODUCTS' heading is visible");
        await this.util.verifyVisible(this.searchedProductsHeading);
    }

    async verifySearchResultsVisible(): Promise<void> {
        this.log.info('Verifying all searched products are visible');
        const count = await this.util.count(this.productList);
        for (let i = 0; i < count; i++) {
            await this.util.verifyVisible(this.productList.nth(i));
        }
    }

    // -------------------------------------------------
    // ACTIONS
    // -------------------------------------------------

    async clickViewProductOfFirstProduct(): Promise<void> {
        this.log.info("Clicking 'View Product' of the first product");
        await this.util.click(this.firstProductViewLink);
    }

    async searchProduct(productName: string): Promise<void> {
        this.log.info(`Searching for product: ${productName}`);
        // Wait for the search-handler script to load before clicking.
        await this.page.waitForLoadState('load');
        await this.util.fill(this.searchInput, productName);
        await this.util.click(this.searchButton);
    }

    async getProductCount(): Promise<number> {
        this.log.info('Reading the number of products listed');
        return this.util.count(this.productList);
    }

    private productWrapper(index: number): Locator {
        return this.productList.nth(index);
    }

    async getProductName(index: number): Promise<string> {
        this.log.info(`Reading the name of the product at index ${index}`);
        return this.util.getInnerText(this.productWrapper(index).locator('.productinfo p'));
    }

    async getProductPrice(index: number): Promise<string> {
        this.log.info(`Reading the price of the product at index ${index}`);
        return this.util.getInnerText(this.productWrapper(index).locator('.productinfo h2'));
    }

    async getAllProductNames(): Promise<string[]> {
        this.log.info('Reading all listed product names');
        return this.util.getAllTexts(this.productList.locator('.productinfo p'));
    }

    async addProductToCart(index: number): Promise<void> {
        this.log.info(`Adding the product at index ${index} to the cart`);
        // Wait for the cart-handler script so the modal opens on click.
        await this.page.waitForLoadState('load');
        const wrapper = this.productWrapper(index);
        await this.util.scrollIntoView(wrapper);
        await this.util.hover(wrapper);
        // The 'Add to cart' button only lifts onto the product while hovered,
        // so the overlay button is the one a user actually clicks.
        await this.util.click(wrapper.locator('.product-overlay .add-to-cart'));
    }

    async clickContinueShopping(): Promise<void> {
        this.log.info("Clicking 'Continue Shopping'");
        await this.util.click(this.continueShoppingButton);
    }

    async clickViewCart(): Promise<void> {
        this.log.info("Clicking 'View Cart'");
        await this.util.click(this.viewCartLink);
    }
}
