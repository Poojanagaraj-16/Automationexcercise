import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

// ---------------------------------------------------------
// BRAND PAGE (left-sidebar brand navigation)
// ---------------------------------------------------------

export class BrandPage extends BasePage {

    private readonly brandsSidebar: Locator;
    private readonly brandHeading: Locator;
    private readonly productList: Locator;

    constructor(page: Page) {
        super(page, 'BrandPage');

        this.brandsSidebar = page.locator('.brands_products');
        this.brandHeading = page.locator('.features_items h2.title');
        this.productList = page.locator('.features_items .product-image-wrapper');
    }

    async verifyBrandsVisible(): Promise<void> {
        this.log.info('Verifying the brands sidebar is visible');
        await this.util.verifyVisible(this.brandsSidebar);
        await this.util.verifyVisible(this.brandsSidebar.locator('.brands-name'));
    }

    async clickBrand(brand: string): Promise<void> {
        this.log.info(`Clicking the '${brand}' brand`);
        await this.util.click(this.brandsSidebar.locator('a', { hasText: brand }));
    }

    async verifyBrandHeading(expectedHeading: string): Promise<void> {
        this.log.info(`Verifying the brand heading: ${expectedHeading}`);
        await this.util.verifyText(this.brandHeading.first(), expectedHeading);
    }

    async verifyBrandProductsVisible(): Promise<void> {
        this.log.info('Verifying the brand products are visible');
        await this.util.verifyVisible(this.productList.first());
    }
}
