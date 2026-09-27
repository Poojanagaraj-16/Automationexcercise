/**
 * UtilElementLocator
 *
 * Common reusable Playwright actions for the AutomationExercise
 * UI automation framework. Page Objects use this wrapper so that
 * frequently repeated interactions (click, fill, verify, scroll...)
 * stay consistent and centrally logged.
 *
 * The wrapper accepts either a CSS/XPath string or a Playwright
 * Locator, and always falls back to the Locator API when callers
 * need something the wrapper does not provide.
 */

import { expect, Locator, Page } from '@playwright/test';
import { createLogger, type Logger } from './logger';

// ---------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------

export const DEFAULT_ACTION_TIMEOUT_MS = 15_000;
export const DEFAULT_NAVIGATION_TIMEOUT_MS = 30_000;

/** A target can be a CSS/XPath selector string or a Playwright Locator. */
export type FlexLocator = string | Locator;

// ---------------------------------------------------------
// UTIL ELEMENT LOCATOR
// ---------------------------------------------------------

export class UtilElementLocator {

    private readonly page: Page;
    private readonly log: Logger;

    constructor(page: Page, scope = 'UtilElementLocator') {
        this.page = page;
        this.log = createLogger(scope);
    }

    // -----------------------------------------------------
    // INTERNAL HELPERS
    // -----------------------------------------------------

    private toLocator(target: FlexLocator): Locator {
        return typeof target === 'string' ? this.page.locator(target) : target;
    }

    private describe(target: FlexLocator): string {
        return typeof target === 'string' ? target : target.toString();
    }

    // =====================================================
    // NAVIGATION
    // =====================================================

    async goto(
        url: string,
        timeout: number = DEFAULT_NAVIGATION_TIMEOUT_MS
    ): Promise<void> {

        this.log.info(`Navigate: ${url}`);

        await this.page.goto(url, {
            timeout,
            waitUntil: 'domcontentloaded'
        });
    }

    async waitForPageLoad(): Promise<void> {
        this.log.debug('Waiting for page to load');
        await this.page.waitForLoadState('domcontentloaded');
    }

    async getTitle(): Promise<string> {
        return this.page.title();
    }

    async getCurrentUrl(): Promise<string> {
        return this.page.url();
    }

    async waitForUrl(
        url: string | RegExp,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {
        await this.page.waitForURL(url, { timeout });
    }

    // =====================================================
    // MOUSE ACTIONS
    // =====================================================

    async click(
        target: FlexLocator,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {

        this.log.debug(`Click: ${this.describe(target)}`);
        await this.toLocator(target).click({ timeout });
    }

    async doubleClick(
        target: FlexLocator,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {

        this.log.debug(`Double click: ${this.describe(target)}`);
        await this.toLocator(target).dblclick({ timeout });
    }

    async rightClick(
        target: FlexLocator,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {

        this.log.debug(`Right click: ${this.describe(target)}`);
        await this.toLocator(target).click({ button: 'right', timeout });
    }

    async hover(
        target: FlexLocator,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {

        this.log.debug(`Hover: ${this.describe(target)}`);
        await this.toLocator(target).hover({ timeout });
    }

    // =====================================================
    // INPUT ACTIONS
    // =====================================================

    async fill(
        target: FlexLocator,
        value: string,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {

        this.log.debug(`Fill: ${this.describe(target)}`);
        await this.toLocator(target).fill(value, { timeout });
    }

    async clearAndFill(
        target: FlexLocator,
        value: string,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {

        const locator = this.toLocator(target);

        this.log.debug(`Clear and fill: ${this.describe(target)}`);

        await locator.clear({ timeout });
        await locator.fill(value, { timeout });
    }

    async type(
        target: FlexLocator,
        value: string,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {

        this.log.debug(`Type: ${this.describe(target)}`);
        await this.toLocator(target).pressSequentially(value, { timeout });
    }

    async clear(
        target: FlexLocator,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {

        this.log.debug(`Clear: ${this.describe(target)}`);
        await this.toLocator(target).clear({ timeout });
    }

    async press(
        target: FlexLocator,
        key: string,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {

        this.log.debug(`Press ${key}: ${this.describe(target)}`);
        await this.toLocator(target).press(key, { timeout });
    }

    // =====================================================
    // TEXT / CONTENT
    // =====================================================

    async getText(target: FlexLocator): Promise<string> {
        return ((await this.toLocator(target).textContent()) ?? '').trim();
    }

    async getInnerText(target: FlexLocator): Promise<string> {
        return (await this.toLocator(target).innerText()).trim();
    }

    async getAllTexts(target: FlexLocator): Promise<string[]> {
        const texts = await this.toLocator(target).allTextContents();
        return texts.map(text => text.trim());
    }

    async getAttr(target: FlexLocator, name: string): Promise<string | null> {
        return this.toLocator(target).getAttribute(name);
    }

    async getValue(target: FlexLocator): Promise<string> {
        return this.toLocator(target).inputValue();
    }

    async count(target: FlexLocator): Promise<number> {
        return this.toLocator(target).count();
    }

    // =====================================================
    // STATE CHECKS
    // =====================================================

    async isVisible(target: FlexLocator): Promise<boolean> {
        return this.toLocator(target).isVisible();
    }

    async isEnabled(target: FlexLocator): Promise<boolean> {
        return this.toLocator(target).isEnabled();
    }

    async isChecked(target: FlexLocator): Promise<boolean> {
        return this.toLocator(target).isChecked();
    }

    // =====================================================
    // WAIT METHODS (used only where auto-waiting is not enough)
    // =====================================================

    async waitForVisible(
        target: FlexLocator,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {
        await expect(this.toLocator(target)).toBeVisible({ timeout });
    }

    async waitForHidden(
        target: FlexLocator,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {
        await expect(this.toLocator(target)).toBeHidden({ timeout });
    }

    // =====================================================
    // SELECT / DROPDOWN
    // =====================================================

    async selectByText(target: FlexLocator, text: string): Promise<void> {
        this.log.debug(`Select by text: ${text}`);
        await this.toLocator(target).selectOption({ label: text });
    }

    async selectByValue(target: FlexLocator, value: string): Promise<void> {
        this.log.debug(`Select by value: ${value}`);
        await this.toLocator(target).selectOption({ value });
    }

    async selectByIndex(target: FlexLocator, index: number): Promise<void> {
        this.log.debug(`Select by index: ${index}`);
        await this.toLocator(target).selectOption({ index });
    }

    // =====================================================
    // CHECKBOX / RADIO
    // =====================================================

    async check(
        target: FlexLocator,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {
        this.log.debug(`Check: ${this.describe(target)}`);
        await this.toLocator(target).check({ timeout });
    }

    async uncheck(
        target: FlexLocator,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {
        this.log.debug(`Uncheck: ${this.describe(target)}`);
        await this.toLocator(target).uncheck({ timeout });
    }

    // =====================================================
    // FILE UPLOAD
    // =====================================================

    async uploadFile(target: FlexLocator, filePath: string): Promise<void> {
        this.log.debug(`Upload file: ${filePath}`);
        await this.toLocator(target).setInputFiles(filePath);
    }

    // =====================================================
    // SCROLL
    // =====================================================

    async scrollIntoView(target: FlexLocator): Promise<void> {
        this.log.debug(`Scroll into view: ${this.describe(target)}`);
        await this.toLocator(target).scrollIntoViewIfNeeded();
    }

    async scrollToTop(): Promise<void> {
        this.log.debug('Scrolling to top of page');
        await this.page.evaluate(() => window.scrollTo(0, 0));
    }

    async scrollToBottom(): Promise<void> {
        this.log.debug('Scrolling to bottom of page');
        await this.page.evaluate(() =>
            window.scrollTo(0, document.body.scrollHeight)
        );
    }

    // =====================================================
    // SCREENSHOT
    // =====================================================

    async takeScreenshot(filePath: string, fullPage = true): Promise<void> {
        this.log.info(`Capturing screenshot: ${filePath}`);
        await this.page.screenshot({ path: filePath, fullPage });
    }

    // =====================================================
    // ASSERTIONS
    // =====================================================

    async verifyVisible(
        target: FlexLocator,
        timeout: number = DEFAULT_ACTION_TIMEOUT_MS
    ): Promise<void> {
        await expect(this.toLocator(target)).toBeVisible({ timeout });
    }

    async verifyText(target: FlexLocator, expectedText: string): Promise<void> {
        await expect(this.toLocator(target)).toContainText(expectedText);
    }

    async verifyValue(target: FlexLocator, expectedValue: string): Promise<void> {
        await expect(this.toLocator(target)).toHaveValue(expectedValue);
    }
}
