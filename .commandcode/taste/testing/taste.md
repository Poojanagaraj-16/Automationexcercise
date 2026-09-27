# Testing / Automation Preferences

- Prefers the Page Object Model (POM) architecture for UI automation frameworks. Confidence: 0.9
- Prefers a BasePage holding common shared functionality (navigation, common click/fill, visibility/text verification, scrolling, screenshot, common error logging), with every page class extending it; no duplicated common functionality across page classes. Confidence: 0.85
- Prefers Playwright's semantic locators (getByRole, getByLabel, getByPlaceholder, getByText, getByTestId) over CSS/XPath; CSS/XPath only when a reliable semantic locator is unavailable. Confidence: 0.9
- Wants locators and page-specific actions/reusable methods encapsulated in page objects; no raw selectors duplicated throughout test files. Confidence: 0.9
- Wants test files to express readable test flow that mirrors the manual test case, not implementation detail. Confidence: 0.85
- Centralizes random/dynamic test-data generation in a single dedicated generator utility rather than generating random data inline in each test. Confidence: 0.85
- Separates static/reusable test data (JSON files) from test logic; runtime-generated values should not be hardcoded as static JSON. Confidence: 0.85
- Wants tests to be independent — no ordering assumptions or unnecessary dependency on another test's side effects. Confidence: 0.8
- Prefers Playwright's auto-waiting and avoids unnecessary waitForTimeout. Confidence: 0.85
- Stack of choice: Playwright with TypeScript; Winston for logging; Faker for random data. Confidence: 0.8
- Configures reporters centrally (e.g. standard HTML reporter plus a custom reporter) and captures screenshots on failure and trace on retry/failure. Confidence: 0.8
- Expects real, proper handling of Playwright features rather than superficial clicks — e.g. validate file downloads (starts, saved, non-empty) and handle dialogs/alerts correctly. Confidence: 0.75
