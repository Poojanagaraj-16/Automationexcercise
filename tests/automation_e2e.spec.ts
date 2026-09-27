/**
 * AutomationExercise — official UI test cases (1 to 26).
 * Source of truth: https://automationexercise.com/test_cases
 *
 * This spec contains the TEST FLOW only. All locators and page-specific
 * actions live in the Page Objects; all dynamic data comes from the
 * RandomDataGenerator; static/reusable data comes from test-data/*.json.
 */

import path from 'path';
import { test, expect } from '../fixtures/test-base';
import { RandomDataGenerator } from '../utils/random-data-generator';

import productsData from '../test-data/products.json';
import userDefaults from '../test-data/users.json';

const BASE_URL = 'https://automationexercise.com';

// Static/reusable values loaded from test-data/*.json so the test flow stays
// free of hardcoded data (dynamic values come from RandomDataGenerator).
const SEARCH_TERM = productsData.searchTerm;        // Test Cases 9 & 20
const CART_QUANTITY = productsData.cartQuantity;    // Test Case 13
const ORDER_COMMENT = userDefaults.orderComment;    // Test Cases 14, 15, 16 & 24
const REVIEW_TEXT = userDefaults.review.text;       // Test Case 21

// Deterministic file used by Test Case 6 for the Contact Us upload.
const UPLOAD_FILE_PATH = path.resolve(__dirname, '../test-data/contact-upload.txt');

// =========================================================
// TEST CASE 1: Register User
// =========================================================
test.describe('TestCase 1 - Register User', () => {
    test('Register User', async ({ page, homePage, loginPage, signupPage, accountPage, userData }) => {

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click on 'Signup / Login' button", async () => {
            await homePage.clickSignupLogin();
        });

        await test.step("Verify 'New User Signup!' is visible", async () => {
            await loginPage.verifyNewUserSignupVisible();
        });

        await test.step('Enter name and email address', async () => {
            await loginPage.enterSignupNameAndEmail(userData.name, userData.email);
        });

        await test.step("Click 'Signup' button", async () => {
            await loginPage.clickSignupButton();
        });

        await test.step("Verify that 'ENTER ACCOUNT INFORMATION' is visible", async () => {
            await signupPage.verifyAccountInfoVisible();
        });

        await test.step('Fill details: title, name, email, password, date of birth', async () => {
            await signupPage.fillAccountInformation(userData);
        });

        await test.step("Click 'Create Account' button", async () => {
            await signupPage.clickCreateAccount();
        });

        await test.step("Verify that 'ACCOUNT CREATED!' is visible", async () => {
            await accountPage.verifyAccountCreated();
        });

        await test.step("Click 'Continue' button", async () => {
            await accountPage.clickContinue();
        });

        await test.step("Verify that 'Logged in as username' is visible", async () => {
            await accountPage.verifyLoggedInAs(userData.name);
        });

        await test.step("Click 'Delete Account' button", async () => {
            await accountPage.clickDeleteAccount();
        });

        await test.step("Verify that 'ACCOUNT DELETED!' is visible and click 'Continue'", async () => {
            await accountPage.verifyAccountDeleted();
            await accountPage.clickContinue();
        });

        await expect(page).toHaveURL(`${BASE_URL}/`);
    });
});

// =========================================================
// TEST CASE 2: Login User with correct email and password
// =========================================================
test.describe('TestCase 2 - Login User with correct email and password', () => {
    test('Login User with correct email and password', async ({ page, homePage, loginPage, signupPage, accountPage, userData }) => {

        await test.step('Precondition: register the account used for login', async () => {
            await homePage.goto(BASE_URL);
            await homePage.clickSignupLogin();
            await loginPage.startSignup(userData.name, userData.email);
            await signupPage.fillAccountInformation(userData);
            await signupPage.clickCreateAccount();
            await accountPage.verifyAccountCreated();
            await accountPage.clickContinue();
            await accountPage.clickLogout();
        });

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click on 'Signup / Login' button", async () => {
            await homePage.clickSignupLogin();
        });

        await test.step("Verify 'Login to your account' is visible", async () => {
            await loginPage.verifyLoginToAccountVisible();
        });

        await test.step('Enter correct email address and password', async () => {
            await loginPage.enterLoginEmailAndPassword(userData.email, userData.password);
        });

        await test.step("Click 'login' button", async () => {
            await loginPage.clickLoginButton();
        });

        await test.step("Verify that 'Logged in as username' is visible", async () => {
            await accountPage.verifyLoggedInAs(userData.name);
        });

        await test.step("Click 'Delete Account' button", async () => {
            await accountPage.clickDeleteAccount();
        });

        await test.step("Verify that 'ACCOUNT DELETED!' is visible", async () => {
            await accountPage.verifyAccountDeleted();
        });
    });
});

// =========================================================
// TEST CASE 3: Login User with incorrect email and password
// =========================================================
test.describe('TestCase 3 - Login User with incorrect email and password', () => {
    test('Login User with incorrect email and password', async ({ homePage, loginPage }) => {

        const invalidEmail = RandomDataGenerator.email();
        const invalidPassword = RandomDataGenerator.password();

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click on 'Signup / Login' button", async () => {
            await homePage.clickSignupLogin();
        });

        await test.step("Verify 'Login to your account' is visible", async () => {
            await loginPage.verifyLoginToAccountVisible();
        });

        await test.step('Enter incorrect email address and password', async () => {
            await loginPage.enterLoginEmailAndPassword(invalidEmail, invalidPassword);
        });

        await test.step("Click 'login' button", async () => {
            await loginPage.clickLoginButton();
        });

        await test.step("Verify error 'Your email or password is incorrect!' is visible", async () => {
            await loginPage.verifyIncorrectLoginErrorVisible();
        });
    });
});

// =========================================================
// TEST CASE 4: Logout User
// =========================================================
test.describe('TestCase 4 - Logout User', () => {
    test('Logout User', async ({ homePage, loginPage, signupPage, accountPage, userData }) => {

        await test.step('Precondition: register the account used for login', async () => {
            await homePage.goto(BASE_URL);
            await homePage.clickSignupLogin();
            await loginPage.startSignup(userData.name, userData.email);
            await signupPage.fillAccountInformation(userData);
            await signupPage.clickCreateAccount();
            await accountPage.verifyAccountCreated();
            await accountPage.clickContinue();
            await accountPage.clickLogout();
        });

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click on 'Signup / Login' button", async () => {
            await homePage.clickSignupLogin();
        });

        await test.step("Verify 'Login to your account' is visible", async () => {
            await loginPage.verifyLoginToAccountVisible();
        });

        await test.step('Enter correct email address and password', async () => {
            await loginPage.enterLoginEmailAndPassword(userData.email, userData.password);
        });

        await test.step("Click 'login' button", async () => {
            await loginPage.clickLoginButton();
        });

        await test.step("Verify that 'Logged in as username' is visible", async () => {
            await accountPage.verifyLoggedInAs(userData.name);
        });

        await test.step("Click 'Logout' button", async () => {
            await accountPage.clickLogout();
        });

        await test.step('Verify that the user is navigated to the login page', async () => {
            await loginPage.verifyNavigatedToLoginPage();
        });
    });
});

// =========================================================
// TEST CASE 5: Register User with existing email
// =========================================================
test.describe('TestCase 5 - Register User with existing email', () => {
    test('Register User with existing email', async ({ homePage, loginPage, signupPage, accountPage, userData }) => {

        await test.step('Precondition: register the email that will be reused', async () => {
            await homePage.goto(BASE_URL);
            await homePage.clickSignupLogin();
            await loginPage.startSignup(userData.name, userData.email);
            await signupPage.fillAccountInformation(userData);
            await signupPage.clickCreateAccount();
            await accountPage.verifyAccountCreated();
            await accountPage.clickContinue();
            await accountPage.clickLogout();
        });

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click on 'Signup / Login' button", async () => {
            await homePage.clickSignupLogin();
        });

        await test.step("Verify 'New User Signup!' is visible", async () => {
            await loginPage.verifyNewUserSignupVisible();
        });

        await test.step('Enter name and already registered email address', async () => {
            await loginPage.enterSignupNameAndEmail(userData.name, userData.email);
        });

        await test.step("Click 'Signup' button", async () => {
            await loginPage.clickSignupButton();
        });

        await test.step("Verify error 'Email Address already exist!' is visible", async () => {
            await loginPage.verifyEmailAlreadyExistsErrorVisible();
        });
    });
});

// =========================================================
// TEST CASE 6: Contact Us Form
// =========================================================
test.describe('TestCase 6 - Contact Us Form', () => {
    test('Contact Us Form', async ({ page, homePage, contactUsPage }) => {

        const contactData = RandomDataGenerator.contactData();

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click on 'Contact Us' button", async () => {
            await homePage.clickContactUs();
        });

        await test.step("Verify 'GET IN TOUCH' is visible", async () => {
            await contactUsPage.verifyGetInTouchHeadingVisible();
        });

        await test.step('Enter name, email, subject and message', async () => {
            await contactUsPage.fillContactForm(
                contactData.name,
                contactData.email,
                contactData.subject,
                contactData.message
            );
        });

        await test.step('Upload file', async () => {
            await contactUsPage.uploadFile(UPLOAD_FILE_PATH);
        });

        await test.step("Click 'Submit' button and accept the confirmation dialog", async () => {
            await contactUsPage.submitAndAcceptDialog();
        });

        await test.step('Verify success message is visible', async () => {
            await contactUsPage.verifySuccessMessageVisible();
        });

        await test.step("Click 'Home' button and verify landing back on the home page", async () => {
            await contactUsPage.clickHomeButton();
            await homePage.verifyHomePageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/`);
        });
    });
});

// =========================================================
// TEST CASE 7: Verify Test Cases Page
// =========================================================
test.describe('TestCase 7 - Verify Test Cases Page', () => {
    test('Verify Test Cases Page', async ({ page, homePage, testCasesPage }) => {

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click on 'Test Cases' button", async () => {
            await homePage.clickTestCases();
        });

        await test.step('Verify the user is navigated to the Test Cases page successfully', async () => {
            await testCasesPage.verifyTestCasesPageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/test_cases`);
        });
    });
});

// =========================================================
// TEST CASE 8: Verify All Products and product detail page
// =========================================================
test.describe('TestCase 8 - Verify All Products and product detail page', () => {
    test('Verify All Products and product detail page', async ({ page, homePage, productsPage, productDetailsPage }) => {

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click on 'Products' button", async () => {
            await homePage.clickProducts();
        });

        await test.step("Verify the user is navigated to the 'ALL PRODUCTS' page successfully", async () => {
            await productsPage.verifyAllProductsPageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/products`);
        });

        await test.step('Verify that the products list is visible', async () => {
            await productsPage.verifyProductListVisible();
        });

        await test.step("Click on 'View Product' of the first product", async () => {
            await productsPage.clickViewProductOfFirstProduct();
        });

        await test.step('Verify the user is landed on the product detail page', async () => {
            await expect(page).toHaveURL(/\/product_details\/\d+/);
        });

        await test.step('Verify that details are visible: name, category, price, availability, condition, brand', async () => {
            await productDetailsPage.verifyProductDetailsVisible();
        });
    });
});

// =========================================================
// TEST CASE 9: Search Product
// =========================================================
test.describe('TestCase 9 - Search Product', () => {
    test('Search Product', async ({ page, homePage, productsPage }) => {

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click on 'Products' button", async () => {
            await homePage.clickProducts();
        });

        await test.step("Verify the user is navigated to the 'ALL PRODUCTS' page successfully", async () => {
            await productsPage.verifyAllProductsPageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/products`);
        });

        await test.step('Enter product name in the search input and click the search button', async () => {
            await productsPage.searchProduct(SEARCH_TERM);
        });

        await test.step("Verify 'SEARCHED PRODUCTS' is visible", async () => {
            await productsPage.verifySearchedProductsHeadingVisible();
        });

        await test.step('Verify all the products related to the search are visible', async () => {
            await productsPage.verifySearchResultsVisible();
        });
    });
});

// =========================================================
// TEST CASE 10: Verify Subscription in home page
// =========================================================
test.describe('TestCase 10 - Verify Subscription in home page', () => {
    test('Verify Subscription in home page', async ({ homePage }) => {

        const email = RandomDataGenerator.email();

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step('Scroll down to the footer', async () => {
            await homePage.scrollToFooter();
        });

        await test.step("Verify text 'SUBSCRIPTION'", async () => {
            await homePage.verifySubscriptionHeadingVisible();
        });

        await test.step('Enter email address and click the arrow button', async () => {
            await homePage.subscribeWithEmail(email);
        });

        await test.step("Verify success message 'You have been successfully subscribed!' is visible", async () => {
            await homePage.verifySubscriptionSuccessMessageVisible();
        });
    });
});

// =========================================================
// TEST CASE 11: Verify Subscription in Cart page
// =========================================================
test.describe('TestCase 11 - Verify Subscription in Cart page', () => {
    test('Verify Subscription in Cart page', async ({ homePage, cartPage }) => {

        const email = RandomDataGenerator.email();

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click 'Cart' button", async () => {
            await homePage.clickCart();
        });

        await test.step('Verify that the cart page is visible successfully', async () => {
            await cartPage.verifyCartPageVisible();
        });

        await test.step('Scroll down to the footer', async () => {
            await cartPage.scrollToFooter();
        });

        await test.step("Verify text 'SUBSCRIPTION'", async () => {
            await cartPage.verifySubscriptionHeadingVisible();
        });

        await test.step('Enter email address and click the arrow button', async () => {
            await cartPage.subscribeWithEmail(email);
        });

        await test.step("Verify success message 'You have been successfully subscribed!' is visible", async () => {
            await cartPage.verifySubscriptionSuccessMessageVisible();
        });
    });
});

// =========================================================
// TEST CASE 12: Add Products in Cart
// =========================================================
test.describe('TestCase 12 - Add Products in Cart', () => {
    test('Add Products in Cart', async ({ page, homePage, productsPage, cartPage }) => {

        let firstProductName = '';
        let firstProductPrice = '';
        let secondProductName = '';
        let secondProductPrice = '';

        // Prices are rendered as 'Rs. 500', so keep only the numeric part.
        const toAmount = (price: string): number => Number(price.replace(/[^\d.]/g, ''));

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click 'Products' button", async () => {
            await homePage.clickProducts();
        });

        await test.step("Hover over the first product and click 'Add to cart'", async () => {
            firstProductName = await productsPage.getProductName(0);
            firstProductPrice = await productsPage.getProductPrice(0);
            await productsPage.addProductToCart(0);
        });

        await test.step("Click 'Continue Shopping' button", async () => {
            await productsPage.clickContinueShopping();
        });

        await test.step("Hover over the second product and click 'Add to cart'", async () => {
            secondProductName = await productsPage.getProductName(1);
            secondProductPrice = await productsPage.getProductPrice(1);
            await productsPage.addProductToCart(1);
        });

        await test.step("Click 'View Cart' button", async () => {
            await productsPage.clickViewCart();
        });

        await test.step('Verify both products are added to the cart', async () => {
            await cartPage.verifyCartPageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/view_cart`);
            expect(await cartPage.getCartItemCount()).toBe(2);
            expect(await cartPage.getCartProductNames()).toEqual([firstProductName, secondProductName]);
        });

        await test.step('Verify their prices, quantity and total price', async () => {
            const prices = await cartPage.getCartProductPrices();
            const quantities = await cartPage.getCartProductQuantities();
            const totals = await cartPage.getCartProductTotals();

            expect(prices).toEqual([firstProductPrice, secondProductPrice]);
            expect(quantities).toEqual(['1', '1']);
            expect(totals).toEqual([firstProductPrice, secondProductPrice]);

            const expectedTotal = toAmount(firstProductPrice) + toAmount(secondProductPrice);
            const cartTotal = totals.reduce((sum, total) => sum + toAmount(total), 0);
            expect(cartTotal).toBe(expectedTotal);
        });
    });
});

// =========================================================
// TEST CASE 13: Verify Product quantity in Cart
// =========================================================
test.describe('TestCase 13 - Verify Product quantity in Cart', () => {
    test('Verify Product quantity in Cart', async ({ page, homePage, productDetailsPage, cartPage }) => {

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click 'View Product' for any product on the home page", async () => {
            await homePage.clickViewProductOfFirstProduct();
        });

        await test.step('Verify that the product detail page is opened', async () => {
            await expect(page).toHaveURL(/\/product_details\/\d+/);
            await productDetailsPage.verifyProductDetailOpen();
        });

        await test.step(`Increase quantity to ${CART_QUANTITY}`, async () => {
            await productDetailsPage.setQuantity(CART_QUANTITY);
        });

        await test.step("Click 'Add to cart' button", async () => {
            await productDetailsPage.addToCart();
        });

        await test.step("Click 'View Cart' button", async () => {
            await productDetailsPage.clickViewCart();
            await expect(page).toHaveURL(`${BASE_URL}/view_cart`);
        });

        await test.step('Verify that the product is displayed in the cart page with the exact quantity', async () => {
            await cartPage.verifyCartPageVisible();
            expect(await cartPage.getCartItemCount()).toBe(1);
            await cartPage.verifyCartProductQuantity(String(CART_QUANTITY));
        });
    });
});

// =========================================================
// TEST CASE 14: Place Order: Register while Checkout
// =========================================================
test.describe('TestCase 14 - Place Order: Register while Checkout', () => {
    test('Place Order: Register while Checkout', async ({ page, homePage, productsPage, cartPage, checkoutPage, paymentPage, loginPage, signupPage, accountPage, userData }) => {

        const paymentData = RandomDataGenerator.paymentData();

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step('Add products to cart', async () => {
            await homePage.clickProducts();
            await productsPage.addProductToCart(0);
            await productsPage.clickContinueShopping();
        });

        await test.step("Click 'Cart' button", async () => {
            await homePage.clickCart();
        });

        await test.step('Verify that the cart page is displayed', async () => {
            await cartPage.verifyCartPageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/view_cart`);
        });

        await test.step("Click 'Proceed To Checkout'", async () => {
            await cartPage.clickProceedToCheckout();
            await cartPage.verifyCheckoutModalVisible();
        });

        await test.step("Click 'Register / Login' button", async () => {
            await cartPage.clickRegisterLoginFromModal();
        });

        await test.step('Fill all details in Signup and create account', async () => {
            await loginPage.startSignup(userData.name, userData.email);
            await signupPage.verifyAccountInfoVisible();
            await signupPage.fillAccountInformation(userData);
            await signupPage.clickCreateAccount();
        });

        await test.step("Verify 'ACCOUNT CREATED!' and click 'Continue' button", async () => {
            await accountPage.verifyAccountCreated();
            await accountPage.clickContinue();
        });

        await test.step("Verify 'Logged in as username' at top", async () => {
            await accountPage.verifyLoggedInAs(userData.name);
        });

        await test.step("Click 'Cart' button", async () => {
            await homePage.clickCart();
        });

        await test.step("Click 'Proceed To Checkout' button", async () => {
            await cartPage.clickProceedToCheckout();
            await expect(page).toHaveURL(`${BASE_URL}/checkout`);
        });

        await test.step('Verify Address Details and Review Your Order', async () => {
            await checkoutPage.verifyCheckoutPageVisible();
            await checkoutPage.verifyAddressDetails();
            await checkoutPage.verifyReviewOrder();
        });

        await test.step("Enter description in comment text area and click 'Place Order'", async () => {
            await checkoutPage.enterComment(ORDER_COMMENT);
            await checkoutPage.clickPlaceOrder();
            await expect(page).toHaveURL(`${BASE_URL}/payment`);
        });

        await test.step('Enter payment details: Name on Card, Card Number, CVC, Expiration date', async () => {
            await paymentPage.verifyPaymentPageVisible();
            await paymentPage.fillPaymentDetails(paymentData);
        });

        await test.step("Click 'Pay and Confirm Order' button", async () => {
            await paymentPage.clickPayAndConfirmOrder();
        });

        await test.step("Verify success message 'Your order has been placed successfully!'", async () => {
            await paymentPage.verifyOrderPlacedSuccessfully();
        });

        await test.step("Click 'Delete Account' button", async () => {
            await accountPage.clickDeleteAccount();
        });

        await test.step("Verify 'ACCOUNT DELETED!' and click 'Continue' button", async () => {
            await accountPage.verifyAccountDeleted();
            await accountPage.clickContinue();
            await expect(page).toHaveURL(`${BASE_URL}/`);
        });
    });
});

// =========================================================
// TEST CASE 15: Place Order: Register before Checkout
// =========================================================
test.describe('TestCase 15 - Place Order: Register before Checkout', () => {
    test('Place Order: Register before Checkout', async ({ page, homePage, productsPage, cartPage, checkoutPage, paymentPage, loginPage, signupPage, accountPage, userData }) => {

        const paymentData = RandomDataGenerator.paymentData();

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click 'Signup / Login' button", async () => {
            await homePage.clickSignupLogin();
        });

        await test.step('Fill all details in Signup and create account', async () => {
            await loginPage.startSignup(userData.name, userData.email);
            await signupPage.verifyAccountInfoVisible();
            await signupPage.fillAccountInformation(userData);
            await signupPage.clickCreateAccount();
        });

        await test.step("Verify 'ACCOUNT CREATED!' and click 'Continue' button", async () => {
            await accountPage.verifyAccountCreated();
            await accountPage.clickContinue();
        });

        await test.step("Verify 'Logged in as username' at top", async () => {
            await accountPage.verifyLoggedInAs(userData.name);
        });

        await test.step('Add products to cart', async () => {
            await homePage.clickProducts();
            await productsPage.addProductToCart(0);
            await productsPage.clickContinueShopping();
        });

        await test.step("Click 'Cart' button", async () => {
            await homePage.clickCart();
        });

        await test.step('Verify that the cart page is displayed', async () => {
            await cartPage.verifyCartPageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/view_cart`);
        });

        await test.step("Click 'Proceed To Checkout'", async () => {
            await cartPage.clickProceedToCheckout();
            await expect(page).toHaveURL(`${BASE_URL}/checkout`);
        });

        await test.step('Verify Address Details and Review Your Order', async () => {
            await checkoutPage.verifyCheckoutPageVisible();
            await checkoutPage.verifyAddressDetails();
            await checkoutPage.verifyReviewOrder();
        });

        await test.step("Enter description in comment text area and click 'Place Order'", async () => {
            await checkoutPage.enterComment(ORDER_COMMENT);
            await checkoutPage.clickPlaceOrder();
            await expect(page).toHaveURL(`${BASE_URL}/payment`);
        });

        await test.step('Enter payment details: Name on Card, Card Number, CVC, Expiration date', async () => {
            await paymentPage.verifyPaymentPageVisible();
            await paymentPage.fillPaymentDetails(paymentData);
        });

        await test.step("Click 'Pay and Confirm Order' button", async () => {
            await paymentPage.clickPayAndConfirmOrder();
        });

        await test.step("Verify success message 'Your order has been placed successfully!'", async () => {
            await paymentPage.verifyOrderPlacedSuccessfully();
        });

        await test.step("Click 'Delete Account' button", async () => {
            await accountPage.clickDeleteAccount();
        });

        await test.step("Verify 'ACCOUNT DELETED!' and click 'Continue' button", async () => {
            await accountPage.verifyAccountDeleted();
            await accountPage.clickContinue();
            await expect(page).toHaveURL(`${BASE_URL}/`);
        });
    });
});

// =========================================================
// TEST CASE 16: Place Order: Login before Checkout
// =========================================================
test.describe('TestCase 16 - Place Order: Login before Checkout', () => {
    test('Place Order: Login before Checkout', async ({ page, homePage, productsPage, cartPage, checkoutPage, paymentPage, loginPage, signupPage, accountPage, userData }) => {

        const paymentData = RandomDataGenerator.paymentData();

        await test.step('Precondition: register the account used for login', async () => {
            await homePage.goto(BASE_URL);
            await homePage.clickSignupLogin();
            await loginPage.startSignup(userData.name, userData.email);
            await signupPage.fillAccountInformation(userData);
            await signupPage.clickCreateAccount();
            await accountPage.verifyAccountCreated();
            await accountPage.clickContinue();
            await accountPage.clickLogout();
        });

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click 'Signup / Login' button", async () => {
            await homePage.clickSignupLogin();
        });

        await test.step("Fill email, password and click 'Login' button", async () => {
            await loginPage.verifyLoginToAccountVisible();
            await loginPage.enterLoginEmailAndPassword(userData.email, userData.password);
            await loginPage.clickLoginButton();
        });

        await test.step("Verify 'Logged in as username' at top", async () => {
            await accountPage.verifyLoggedInAs(userData.name);
        });

        await test.step('Add products to cart', async () => {
            await homePage.clickProducts();
            await productsPage.addProductToCart(0);
            await productsPage.clickContinueShopping();
        });

        await test.step("Click 'Cart' button", async () => {
            await homePage.clickCart();
        });

        await test.step('Verify that the cart page is displayed', async () => {
            await cartPage.verifyCartPageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/view_cart`);
        });

        await test.step("Click 'Proceed To Checkout'", async () => {
            await cartPage.clickProceedToCheckout();
            await expect(page).toHaveURL(`${BASE_URL}/checkout`);
        });

        await test.step('Verify Address Details and Review Your Order', async () => {
            await checkoutPage.verifyCheckoutPageVisible();
            await checkoutPage.verifyAddressDetails();
            await checkoutPage.verifyReviewOrder();
        });

        await test.step("Enter description in comment text area and click 'Place Order'", async () => {
            await checkoutPage.enterComment(ORDER_COMMENT);
            await checkoutPage.clickPlaceOrder();
            await expect(page).toHaveURL(`${BASE_URL}/payment`);
        });

        await test.step('Enter payment details: Name on Card, Card Number, CVC, Expiration date', async () => {
            await paymentPage.verifyPaymentPageVisible();
            await paymentPage.fillPaymentDetails(paymentData);
        });

        await test.step("Click 'Pay and Confirm Order' button", async () => {
            await paymentPage.clickPayAndConfirmOrder();
        });

        await test.step("Verify success message 'Your order has been placed successfully!'", async () => {
            await paymentPage.verifyOrderPlacedSuccessfully();
        });

        await test.step("Click 'Delete Account' button", async () => {
            await accountPage.clickDeleteAccount();
        });

        await test.step("Verify 'ACCOUNT DELETED!' and click 'Continue' button", async () => {
            await accountPage.verifyAccountDeleted();
            await accountPage.clickContinue();
            await expect(page).toHaveURL(`${BASE_URL}/`);
        });
    });
});

// =========================================================
// TEST CASE 17: Remove Products From Cart
// =========================================================
test.describe('TestCase 17 - Remove Products From Cart', () => {
    test('Remove Products From Cart', async ({ page, homePage, productsPage, cartPage }) => {

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step('Add products to cart', async () => {
            await homePage.clickProducts();
            await productsPage.addProductToCart(0);
            await productsPage.clickContinueShopping();
        });

        await test.step("Click 'Cart' button", async () => {
            await homePage.clickCart();
        });

        await test.step('Verify that the cart page is displayed', async () => {
            await cartPage.verifyCartPageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/view_cart`);
            expect(await cartPage.getCartItemCount()).toBe(1);
        });

        await test.step("Click 'X' button corresponding to the product", async () => {
            await cartPage.removeProduct(0);
        });

        await test.step('Verify that the product is removed from the cart', async () => {
            await cartPage.verifyCartEmpty();
            expect(await cartPage.getCartItemCount()).toBe(0);
        });
    });
});

// =========================================================
// TEST CASE 18: View Category Products
// =========================================================
test.describe('TestCase 18 - View Category Products', () => {
    test('View Category Products', async ({ page, homePage, categoryPage }) => {

        const women = productsData.categories.women;
        const men = productsData.categories.men;

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step('Verify that categories are visible on the left side bar', async () => {
            await categoryPage.verifyCategoriesVisible();
        });

        await test.step("Click on 'Women' category", async () => {
            await categoryPage.expandCategory('Women');
        });

        await test.step("Click on any category link under 'Women' category", async () => {
            await categoryPage.clickSubCategory('Women', women.sub);
            await expect(page).toHaveURL(/\/category_products\/\d+/);
        });

        await test.step(`Verify that the category page is displayed with '${women.heading}'`, async () => {
            await categoryPage.verifyCategoryHeading(women.heading);
        });

        await test.step("On the left side bar, click on any sub-category link of the 'Men' category", async () => {
            await categoryPage.expandCategory('Men');
            await categoryPage.clickSubCategory('Men', men.sub);
        });

        await test.step('Verify that the user is navigated to that category page', async () => {
            await expect(page).toHaveURL(/\/category_products\/\d+/);
            await categoryPage.verifyCategoryHeading(men.heading);
        });
    });
});

// =========================================================
// TEST CASE 19: View & Cart Brand Products
// =========================================================
test.describe('TestCase 19 - View & Cart Brand Products', () => {
    test('View & Cart Brand Products', async ({ page, homePage, brandPage }) => {

        const firstBrand = productsData.brands.first;
        const secondBrand = productsData.brands.second;

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step("Click on 'Products' button", async () => {
            await homePage.clickProducts();
        });

        await test.step('Verify that brands are visible on the left side bar', async () => {
            await expect(page).toHaveURL(`${BASE_URL}/products`);
            await brandPage.verifyBrandsVisible();
        });

        await test.step('Click on any brand name', async () => {
            await brandPage.clickBrand(firstBrand);
            await expect(page).toHaveURL(new RegExp(`/brand_products/${firstBrand}`));
        });

        await test.step('Verify that the user is navigated to the brand page and brand products are displayed', async () => {
            await brandPage.verifyBrandHeading(`Brand - ${firstBrand} Products`);
            await brandPage.verifyBrandProductsVisible();
        });

        await test.step('On the left side bar, click on any other brand link', async () => {
            await brandPage.clickBrand(secondBrand);
            await expect(page).toHaveURL(new RegExp(`/brand_products/${secondBrand}`));
        });

        await test.step('Verify that the user is navigated to that brand page and can see products', async () => {
            await brandPage.verifyBrandHeading(`Brand - ${secondBrand} Products`);
            await brandPage.verifyBrandProductsVisible();
        });
    });
});

// =========================================================
// TEST CASE 20: Search Products and Verify Cart After Login
// =========================================================
test.describe('TestCase 20 - Search Products and Verify Cart After Login', () => {
    test('Search Products and Verify Cart After Login', async ({ page, homePage, loginPage, signupPage, accountPage, productsPage, cartPage, userData }) => {

        const searchedProductNames: string[] = [];

        await test.step('Precondition: register the account used for login', async () => {
            await homePage.goto(BASE_URL);
            await homePage.clickSignupLogin();
            await loginPage.startSignup(userData.name, userData.email);
            await signupPage.fillAccountInformation(userData);
            await signupPage.clickCreateAccount();
            await accountPage.verifyAccountCreated();
            await accountPage.clickContinue();
            await accountPage.clickLogout();
        });

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step("Click on 'Products' button", async () => {
            await homePage.clickProducts();
        });

        await test.step("Verify the user is navigated to the 'ALL PRODUCTS' page successfully", async () => {
            await productsPage.verifyAllProductsPageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/products`);
        });

        await test.step('Enter product name in the search input and click the search button', async () => {
            await productsPage.searchProduct(SEARCH_TERM);
        });

        await test.step("Verify 'SEARCHED PRODUCTS' is visible", async () => {
            await productsPage.verifySearchedProductsHeadingVisible();
        });

        await test.step('Verify all the products related to the search are visible', async () => {
            await productsPage.verifySearchResultsVisible();

            const names = await productsPage.getAllProductNames();
            expect(names.length).toBeGreaterThan(0);
            searchedProductNames.push(...names);
        });

        await test.step('Add those products to cart', async () => {
            for (let i = 0; i < searchedProductNames.length; i++) {
                await productsPage.addProductToCart(i);
                await productsPage.clickContinueShopping();
            }
        });

        await test.step("Click 'Cart' button and verify that products are visible in cart", async () => {
            await homePage.clickCart();
            await cartPage.verifyCartPageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/view_cart`);
            expect(await cartPage.getCartProductNames()).toEqual(searchedProductNames);
        });

        await test.step("Click 'Signup / Login' button and submit login details", async () => {
            await homePage.clickSignupLogin();
            await loginPage.verifyLoginToAccountVisible();
            await loginPage.enterLoginEmailAndPassword(userData.email, userData.password);
            await loginPage.clickLoginButton();
            await accountPage.verifyLoggedInAs(userData.name);
        });

        await test.step('Again, go to the Cart page', async () => {
            await homePage.clickCart();
            await expect(page).toHaveURL(`${BASE_URL}/view_cart`);
        });

        await test.step('Verify that those products are visible in the cart after login as well', async () => {
            await cartPage.verifyCartPageVisible();
            expect(await cartPage.getCartProductNames()).toEqual(searchedProductNames);
        });
    });
});

// =========================================================
// TEST CASE 21: Add review on product
// =========================================================
test.describe('TestCase 21 - Add review on product', () => {
    test('Add review on product', async ({ page, homePage, productsPage, productDetailsPage }) => {

        const reviewName = RandomDataGenerator.fullName();
        const reviewEmail = RandomDataGenerator.email();

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step("Click on 'Products' button", async () => {
            await homePage.clickProducts();
        });

        await test.step("Verify the user is navigated to the 'ALL PRODUCTS' page successfully", async () => {
            await productsPage.verifyAllProductsPageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/products`);
        });

        await test.step("Click on 'View Product' button", async () => {
            await productsPage.clickViewProductOfFirstProduct();
            await expect(page).toHaveURL(/\/product_details\/\d+/);
        });

        await test.step("Verify 'Write Your Review' is visible", async () => {
            await productDetailsPage.verifyWriteYourReviewVisible();
        });

        await test.step('Enter name, email and review', async () => {
            await productDetailsPage.fillReview(reviewName, reviewEmail, REVIEW_TEXT);
        });

        await test.step("Click 'Submit' button", async () => {
            await productDetailsPage.clickSubmitReview();
        });

        await test.step("Verify success message 'Thank you for your review.'", async () => {
            await productDetailsPage.verifyReviewSuccessMessageVisible();
        });
    });
});

// =========================================================
// TEST CASE 22: Add to cart from Recommended items
// =========================================================
test.describe('TestCase 22 - Add to cart from Recommended items', () => {
    test('Add to cart from Recommended items', async ({ page, homePage, cartPage }) => {

        let recommendedProductName = '';

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Scroll to the bottom of the page', async () => {
            await homePage.scrollToRecommendedItems();
        });

        await test.step("Verify 'RECOMMENDED ITEMS' are visible", async () => {
            await homePage.verifyRecommendedItemsVisible();
        });

        await test.step("Click on 'Add To Cart' on a recommended product", async () => {
            recommendedProductName = await homePage.addRecommendedProductToCart(0);
        });

        await test.step("Click on 'View Cart' button", async () => {
            await homePage.clickViewCartFromModal();
            await expect(page).toHaveURL(`${BASE_URL}/view_cart`);
        });

        await test.step('Verify that the product is displayed in the cart page', async () => {
            await cartPage.verifyCartPageVisible();
            expect(await cartPage.getCartItemCount()).toBe(1);
            expect(await cartPage.getCartProductNames()).toEqual([recommendedProductName]);
        });
    });
});

// =========================================================
// TEST CASE 23: Verify address details in checkout page
// =========================================================
test.describe('TestCase 23 - Verify address details in checkout page', () => {
    test('Verify address details in checkout page', async ({ page, homePage, loginPage, signupPage, accountPage, productsPage, cartPage, checkoutPage, userData }) => {

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step("Click 'Signup / Login' button", async () => {
            await homePage.clickSignupLogin();
        });

        await test.step('Fill all details in Signup and create account', async () => {
            await loginPage.startSignup(userData.name, userData.email);
            await signupPage.verifyAccountInfoVisible();
            await signupPage.fillAccountInformation(userData);
            await signupPage.clickCreateAccount();
        });

        await test.step("Verify 'ACCOUNT CREATED!' and click 'Continue' button", async () => {
            await accountPage.verifyAccountCreated();
            await accountPage.clickContinue();
        });

        await test.step("Verify 'Logged in as username' at top", async () => {
            await accountPage.verifyLoggedInAs(userData.name);
        });

        await test.step('Add products to cart', async () => {
            await homePage.clickProducts();
            await productsPage.addProductToCart(0);
            await productsPage.clickContinueShopping();
        });

        await test.step("Click 'Cart' button", async () => {
            await homePage.clickCart();
        });

        await test.step('Verify that the cart page is displayed', async () => {
            await cartPage.verifyCartPageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/view_cart`);
        });

        await test.step("Click 'Proceed To Checkout'", async () => {
            await cartPage.clickProceedToCheckout();
            await expect(page).toHaveURL(`${BASE_URL}/checkout`);
        });

        await test.step('Verify Address Details and Review Your Order', async () => {
            await checkoutPage.verifyCheckoutPageVisible();
            await checkoutPage.verifyAddressDetails();
            await checkoutPage.verifyReviewOrder();
        });

        await test.step('Verify that the delivery and billing addresses match the signup details', async () => {
            await checkoutPage.verifyDeliveryAddressMatchesSignup(userData);
            await checkoutPage.verifyBillingAddressMatchesSignup(userData);
            await checkoutPage.verifyDeliveryAndBillingAddressesAreSame();
        });

        await test.step("Click 'Delete Account' button", async () => {
            await accountPage.clickDeleteAccount();
        });

        await test.step("Verify 'ACCOUNT DELETED!' and click 'Continue' button", async () => {
            await accountPage.verifyAccountDeleted();
            await accountPage.clickContinue();
            await expect(page).toHaveURL(`${BASE_URL}/`);
        });
    });
});

// =========================================================
// TEST CASE 24: Download Invoice after purchase order
// =========================================================
test.describe('TestCase 24 - Download Invoice after purchase order', () => {
    test('Download Invoice after purchase order', async ({ page, homePage, productsPage, cartPage, checkoutPage, paymentPage, loginPage, signupPage, accountPage, userData }) => {

        const paymentData = RandomDataGenerator.paymentData();

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step('Add products to cart', async () => {
            await homePage.clickProducts();
            await productsPage.addProductToCart(0);
            await productsPage.clickContinueShopping();
        });

        await test.step("Click 'Cart' button", async () => {
            await homePage.clickCart();
        });

        await test.step('Verify that the cart page is displayed', async () => {
            await cartPage.verifyCartPageVisible();
            await expect(page).toHaveURL(`${BASE_URL}/view_cart`);
        });

        await test.step("Click 'Proceed To Checkout'", async () => {
            await cartPage.clickProceedToCheckout();
            await cartPage.verifyCheckoutModalVisible();
        });

        await test.step("Click 'Register / Login' button", async () => {
            await cartPage.clickRegisterLoginFromModal();
        });

        await test.step('Fill all details in Signup and create account', async () => {
            await loginPage.startSignup(userData.name, userData.email);
            await signupPage.verifyAccountInfoVisible();
            await signupPage.fillAccountInformation(userData);
            await signupPage.clickCreateAccount();
        });

        await test.step("Verify 'ACCOUNT CREATED!' and click 'Continue' button", async () => {
            await accountPage.verifyAccountCreated();
            await accountPage.clickContinue();
        });

        await test.step("Verify 'Logged in as username' at top", async () => {
            await accountPage.verifyLoggedInAs(userData.name);
        });

        await test.step("Click 'Cart' button", async () => {
            await homePage.clickCart();
        });

        await test.step("Click 'Proceed To Checkout' button", async () => {
            await cartPage.clickProceedToCheckout();
            await expect(page).toHaveURL(`${BASE_URL}/checkout`);
        });

        await test.step('Verify Address Details and Review Your Order', async () => {
            await checkoutPage.verifyCheckoutPageVisible();
            await checkoutPage.verifyAddressDetails();
            await checkoutPage.verifyReviewOrder();
        });

        await test.step("Enter description in comment text area and click 'Place Order'", async () => {
            await checkoutPage.enterComment(ORDER_COMMENT);
            await checkoutPage.clickPlaceOrder();
            await expect(page).toHaveURL(`${BASE_URL}/payment`);
        });

        await test.step('Enter payment details: Name on Card, Card Number, CVC, Expiration date', async () => {
            await paymentPage.verifyPaymentPageVisible();
            await paymentPage.fillPaymentDetails(paymentData);
        });

        await test.step("Click 'Pay and Confirm Order' button", async () => {
            await paymentPage.clickPayAndConfirmOrder();
        });

        await test.step("Verify success message 'Your order has been placed successfully!'", async () => {
            await paymentPage.verifyOrderPlacedSuccessfully();
        });

        await test.step("Click 'Download Invoice' button and verify the invoice is downloaded", async () => {
            const invoiceFileName = await paymentPage.downloadInvoice();
            expect(invoiceFileName.length).toBeGreaterThan(0);
        });

        await test.step("Click 'Continue' button", async () => {
            await paymentPage.clickContinue();
            await expect(page).toHaveURL(`${BASE_URL}/`);
        });

        await test.step("Click 'Delete Account' button", async () => {
            await accountPage.clickDeleteAccount();
        });

        await test.step("Verify 'ACCOUNT DELETED!' and click 'Continue' button", async () => {
            await accountPage.verifyAccountDeleted();
            await accountPage.clickContinue();
            await expect(page).toHaveURL(`${BASE_URL}/`);
        });
    });
});

// =========================================================
// TEST CASE 25: Verify Scroll Up using 'Arrow' button and Scroll Down functionality
// =========================================================
test.describe("TestCase 25 - Verify Scroll Up using 'Arrow' button", () => {
    test("Verify Scroll Up using 'Arrow' button and Scroll Down functionality", async ({ homePage }) => {

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step('Scroll down the page to the bottom', async () => {
            await homePage.scrollToBottomOfPage();
        });

        await test.step("Verify 'SUBSCRIPTION' is visible", async () => {
            await homePage.verifySubscriptionHeadingVisible();
        });

        await test.step('Click on the arrow at the bottom right side to move upward', async () => {
            await homePage.clickScrollUpArrow();
        });

        await test.step("Verify that the page is scrolled up and the hero text is visible", async () => {
            await homePage.verifyPageScrolledToTop();
            await homePage.verifyHeroHeadingVisible();
        });
    });
});

// =========================================================
// TEST CASE 26: Verify Scroll Up without 'Arrow' button and Scroll Down functionality
// =========================================================
test.describe("TestCase 26 - Verify Scroll Up without 'Arrow' button", () => {
    test("Verify Scroll Up without 'Arrow' button and Scroll Down functionality", async ({ homePage }) => {

        await test.step('Launch browser and navigate to the home page', async () => {
            await homePage.goto(BASE_URL);
        });

        await test.step('Verify that the home page is visible successfully', async () => {
            await homePage.verifyHomePageVisible();
        });

        await test.step('Scroll down the page to the bottom', async () => {
            await homePage.scrollToBottomOfPage();
        });

        await test.step("Verify 'SUBSCRIPTION' is visible", async () => {
            await homePage.verifySubscriptionHeadingVisible();
        });

        await test.step('Scroll up the page to the top (without using the arrow button)', async () => {
            await homePage.scrollToTopOfPage();
        });

        await test.step("Verify that the page is scrolled up and the hero text is visible", async () => {
            await homePage.verifyPageScrolledToTop();
            await homePage.verifyHeroHeadingVisible();
        });
    });
});
