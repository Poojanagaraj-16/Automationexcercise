import { Page } from '@playwright/test';
import { UtilElementLocator } from '../utils/UtilElementlocator';
import { createLogger, type Logger } from '../utils/logger';

// ---------------------------------------------------------
// BASE PAGE
//
// Holds the functionality every Page Object shares:
// the page reference, the reusable UI action wrapper, a scoped
// logger, navigation and common verification helpers.
//
// Every child page extends this and adds only its own locators
// and page-specific actions.
// ---------------------------------------------------------

export abstract class BasePage {

    protected readonly page: Page;
    protected readonly util: UtilElementLocator;
    protected readonly log: Logger;

    protected constructor(page: Page, scope: string) {
        this.page = page;
        this.util = new UtilElementLocator(page, scope);
        this.log = createLogger(scope);
    }

    // -------------------------------------------------
    // NAVIGATION
    // -------------------------------------------------

    async goto(url: string): Promise<void> {

        this.log.info(`Opening: ${url}`);

        try {
            await this.util.goto(url);
            await this.util.waitForPageLoad();
        } catch (error) {
            this.log.error(
                `Failed to open ${url}: ${(error as Error).message}`
            );
            throw error;
        }
    }

    async getTitle(): Promise<string> {
        return this.util.getTitle();
    }

    async getCurrentUrl(): Promise<string> {
        return this.util.getCurrentUrl();
    }

    async waitForUrl(url: string | RegExp): Promise<void> {
        await this.util.waitForUrl(url);
    }

    // -------------------------------------------------
    // COMMON SCREENSHOT HELPER
    // -------------------------------------------------

    async takeScreenshot(filePath: string): Promise<void> {
        await this.util.takeScreenshot(filePath);
    }
}
