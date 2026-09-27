import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

// ---------------------------------------------------------
// LOGIN PAGE
// Hosts both the "Login to your account" and
// "New User Signup!" forms on /login
// ---------------------------------------------------------

export class LoginPage extends BasePage {

    // Signup form
    private readonly newUserSignupHeading: Locator;
    private readonly signupNameInput: Locator;
    private readonly signupEmailInput: Locator;
    private readonly signupButton: Locator;
    private readonly signupEmailExistsError: Locator;

    // Login form
    private readonly loginToAccountHeading: Locator;
    private readonly loginEmailInput: Locator;
    private readonly loginPasswordInput: Locator;
    private readonly loginButton: Locator;
    private readonly loginErrorMessage: Locator;

    constructor(page: Page) {
        super(page, 'LoginPage');

        this.newUserSignupHeading = page.getByRole('heading', { name: 'New User Signup!' });
        this.signupNameInput = page.getByTestId('signup-name');
        this.signupEmailInput = page.getByTestId('signup-email');
        this.signupButton = page.getByTestId('signup-button');
        this.signupEmailExistsError = page.getByText('Email Address already exist!');

        this.loginToAccountHeading = page.getByRole('heading', { name: 'Login to your account' });
        this.loginEmailInput = page.getByTestId('login-email');
        this.loginPasswordInput = page.getByTestId('login-password');
        this.loginButton = page.getByTestId('login-button');
        this.loginErrorMessage = page.getByText('Your email or password is incorrect!');
    }

    // -------------------------------------------------
    // VERIFICATIONS
    // -------------------------------------------------

    async verifyNewUserSignupVisible(): Promise<void> {
        this.log.info("Verifying 'New User Signup!' is visible");
        await this.util.verifyVisible(this.newUserSignupHeading);
    }

    async verifyLoginToAccountVisible(): Promise<void> {
        this.log.info("Verifying 'Login to your account' is visible");
        await this.util.verifyVisible(this.loginToAccountHeading);
    }

    async verifyEmailAlreadyExistsErrorVisible(): Promise<void> {
        this.log.info("Verifying 'Email Address already exist!' is visible");
        await this.util.verifyVisible(this.signupEmailExistsError);
    }

    async verifyIncorrectLoginErrorVisible(): Promise<void> {
        this.log.info("Verifying 'Your email or password is incorrect!' is visible");
        await this.util.verifyVisible(this.loginErrorMessage);
    }

    async verifyNavigatedToLoginPage(): Promise<void> {
        this.log.info('Verifying the user is on the login page');
        await this.util.waitForUrl(/\/login/);
        await this.util.verifyVisible(this.loginToAccountHeading);
    }

    // -------------------------------------------------
    // SIGNUP ACTIONS
    // -------------------------------------------------

    async enterSignupNameAndEmail(name: string, email: string): Promise<void> {
        this.log.info(`Entering signup name/email: ${name} / ${email}`);
        await this.util.fill(this.signupNameInput, name);
        await this.util.fill(this.signupEmailInput, email);
    }

    async clickSignupButton(): Promise<void> {
        this.log.info("Clicking 'Signup'");
        await this.util.click(this.signupButton);
    }

    /** Convenience: fill the signup form and submit it. */
    async startSignup(name: string, email: string): Promise<void> {
        await this.enterSignupNameAndEmail(name, email);
        await this.clickSignupButton();
    }

    // -------------------------------------------------
    // LOGIN ACTIONS
    // -------------------------------------------------

    async enterLoginEmailAndPassword(email: string, password: string): Promise<void> {
        this.log.info(`Entering login email: ${email}`);
        await this.util.fill(this.loginEmailInput, email);
        await this.util.fill(this.loginPasswordInput, password);
    }

    async clickLoginButton(): Promise<void> {
        this.log.info("Clicking 'Login'");
        await this.util.click(this.loginButton);
    }

    async login(email: string, password: string): Promise<void> {
        await this.enterLoginEmailAndPassword(email, password);
        await this.clickLoginButton();
    }
}
