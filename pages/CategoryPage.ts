import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

// ---------------------------------------------------------
// CATEGORY PAGE (left-sidebar category navigation)
// ---------------------------------------------------------

export class CategoryPage extends BasePage {

    private readonly categorySidebar: Locator;
    private readonly categoryHeading: Locator;

    constructor(page: Page) {
        super(page, 'CategoryPage');

        this.categorySidebar = page.locator('.left-sidebar');
        this.categoryHeading = page.locator('.features_items h2.title');
    }

    async verifyCategoriesVisible(): Promise<void> {
        this.log.info('Verifying the categories sidebar is visible');
        await this.util.verifyVisible(this.categorySidebar);
        await this.util.verifyVisible(this.categorySidebar.locator('#accordian'));
    }

    /**
     * Expands a top-level category (Bootstrap accordion).
     * Waits for the page to finish loading first — clicking the anchor before
     * the accordion script is bound does nothing — then confirms the panel is
     * actually expanded before returning.
     */
    async expandCategory(category: 'Women' | 'Men' | 'Kids'): Promise<void> {
        this.log.info(`Expanding the '${category}' category`);

        await this.page.waitForLoadState('load');

        const panel = this.categorySidebar.locator(`#${category}`);
        const header = this.categorySidebar.locator(`a[href="#${category}"]`);

        if (!(await panel.isVisible())) {
            await this.util.scrollIntoView(header);
            await this.util.click(header);
        }

        await this.util.waitForVisible(panel);
    }

    async clickSubCategory(
        category: 'Women' | 'Men' | 'Kids',
        subCategory: string
    ): Promise<void> {
        this.log.info(`Clicking '${subCategory}' under '${category}'`);

        const subLink = this.categorySidebar.locator(
            `#${category} a`,
            { hasText: subCategory }
        );

        // The accordion can collapse again if the page's scripts finish
        // initialising after the first expansion, so re-expand until the
        // sub-category link is actually visible.
        for (let attempt = 0; attempt < 3; attempt++) {
            if (await subLink.isVisible()) {
                break;
            }
            await this.expandCategory(category);
        }

        await this.util.scrollIntoView(subLink);
        await this.util.click(subLink);
    }

    async verifyCategoryHeading(expectedHeading: string): Promise<void> {
        this.log.info(`Verifying the category heading: ${expectedHeading}`);
        await this.util.verifyText(this.categoryHeading.first(), expectedHeading);
    }
}
