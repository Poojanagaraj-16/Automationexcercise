import { test as base } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { AccountPage } from '../pages/AccountPage';
import { ContactUsPage } from '../pages/ContactUsPage';
import { TestCasesPage } from '../pages/TestCasesPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { PaymentPage } from '../pages/PaymentPage';
import { CategoryPage } from '../pages/CategoryPage';
import { BrandPage } from '../pages/BrandPage';

import {
    RandomDataGenerator,
    type RegistrationData
} from '../utils/random-data-generator';
import { createLogger } from '../utils/logger';

// Static, reusable profile defaults (dynamic values are generated at runtime).
import userDefaults from '../test-data/users.json';

const log = createLogger('TestFixture');

// ---------------------------------------------------------
// FIXTURES
// ---------------------------------------------------------

type Fixtures = {
    homePage: HomePage;
    loginPage: LoginPage;
    signupPage: SignupPage;
    accountPage: AccountPage;
    contactUsPage: ContactUsPage;
    testCasesPage: TestCasesPage;
    productsPage: ProductsPage;
    productDetailsPage: ProductDetailsPage;
    cartPage: CartPage;
    checkoutPage: CheckoutPage;
    paymentPage: PaymentPage;
    categoryPage: CategoryPage;
    brandPage: BrandPage;

    /** A fresh, unique registration profile generated for every test. */
    userData: RegistrationData;
};

export const test = base.extend<Fixtures>({

    // The site serves ad iframes/interstitials that can overlap and intercept
    // clicks on real elements, so block ad networks for every test.
    page: async ({ page }, use) => {
        await page.route(
            /googlesyndication\.com|doubleclick\.net|googleadservices\.com|adservice\.google\.com|google_vignette/,
            route => route.abort()
        );
        await use(page);
    },

    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },
    loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
    signupPage: async ({ page }, use) => { await use(new SignupPage(page)); },
    accountPage: async ({ page }, use) => { await use(new AccountPage(page)); },
    contactUsPage: async ({ page }, use) => { await use(new ContactUsPage(page)); },
    testCasesPage: async ({ page }, use) => { await use(new TestCasesPage(page)); },
    productsPage: async ({ page }, use) => { await use(new ProductsPage(page)); },
    productDetailsPage: async ({ page }, use) => { await use(new ProductDetailsPage(page)); },
    cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
    checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },
    paymentPage: async ({ page }, use) => { await use(new PaymentPage(page)); },
    categoryPage: async ({ page }, use) => { await use(new CategoryPage(page)); },
    brandPage: async ({ page }, use) => { await use(new BrandPage(page)); },

    userData: async ({ }, use) => {
        const data = RandomDataGenerator.registrationData({
            title: userDefaults.registrationDefaults.title as 'Mr' | 'Mrs',
            country: userDefaults.registrationDefaults.country
        });

        log.info(`Generated registration user: ${data.email}`);
        await use(data);
    }
});

// Marks a searchable boundary in logs/combined.log for each test.
test.beforeEach(async ({ }, testInfo) => {
    log.info(`===== TEST START: ${testInfo.title} =====`);
});

export { expect } from '@playwright/test';
