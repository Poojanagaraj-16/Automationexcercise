import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

// ---------------------------------------------------------
// TEST CASES PAGE
// ---------------------------------------------------------

export class TestCasesPage extends BasePage {

    private readonly testCasesHeading: Locator;

    constructor(page: Page) {
        super(page, 'TestCasesPage');
        this.testCasesHeading = page.getByRole('heading', { name: 'Test Cases', exact: true });
    }

    async verifyTestCasesPageVisible(): Promise<void> {
        this.log.info("Verifying the 'Test Cases' page is visible");
        await this.util.verifyVisible(this.testCasesHeading);
    }
}
