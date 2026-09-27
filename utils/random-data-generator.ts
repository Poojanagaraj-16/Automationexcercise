/**
 * RandomDataGenerator — Faker-backed random test data for the
 * AutomationExercise Playwright framework.
 *
 * All dynamic test data is produced here so that Page Objects and
 * test cases never generate random values inline.
 */

import { faker } from '@faker-js/faker';

// ---------------------------------------------------------
// INTERFACES
// ---------------------------------------------------------

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegistrationData extends LoginCredentials {
    name: string;
    firstName: string;
    lastName: string;
    title: 'Mr' | 'Mrs';
    dateOfBirth: {
        day: string;
        month: string;
        year: string;
    };
    company: string;
    address: string;
    address2: string;
    country: string;
    state: string;
    city: string;
    zipcode: string;
    mobileNumber: string;
}

export interface PaymentData {
    nameOnCard: string;
    cardNumber: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
}

export interface ContactData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface RegistrationDefaults {
    title?: 'Mr' | 'Mrs';
    country?: string;
}

// ---------------------------------------------------------
// DATA GENERATOR
// ---------------------------------------------------------

export class RandomDataGenerator {

    // -----------------------------------------------------
    // BASIC USER DATA
    // -----------------------------------------------------

    static firstName(): string {
        return faker.person.firstName();
    }

    static lastName(): string {
        return faker.person.lastName();
    }

    static fullName(): string {
        return faker.person.fullName();
    }

    /** Unique email — safe to register a new account with on every run. */
    static email(): string {
        return faker.internet.email({
            firstName: faker.string.alphanumeric({ length: 10 }),
            lastName: faker.string.alphanumeric({ length: 6 })
        });
    }

    static password(length = 10): string {
        return faker.internet.password({ length, memorable: false });
    }

    static mobileNumber(): string {
        return faker.phone.number();
    }

    // -----------------------------------------------------
    // ADDRESS DATA
    // -----------------------------------------------------

    static address(): string {
        return faker.location.streetAddress();
    }

    static address2(): string {
        return faker.location.secondaryAddress();
    }

    static company(): string {
        return faker.company.name();
    }

    static state(): string {
        return faker.location.state();
    }

    static city(): string {
        return faker.location.city();
    }

    static zipcode(): string {
        return faker.location.zipCode();
    }

    // -----------------------------------------------------
    // REGISTRATION DATA
    // -----------------------------------------------------

    /**
     * Builds a complete, unique registration profile.
     * Static pieces (title, country) can be supplied from JSON test data.
     */
    static registrationData(
        defaults: RegistrationDefaults = {}
    ): RegistrationData {

        const firstName = this.firstName();
        const lastName = this.lastName();

        return {

            name: `${firstName} ${lastName}`,

            firstName,

            lastName,

            title: defaults.title ?? 'Mr',

            email: this.email(),

            password: this.password(),

            dateOfBirth: {
                day: faker.number.int({ min: 1, max: 28 }).toString(),
                month: faker.number.int({ min: 1, max: 12 }).toString(),
                year: faker.number.int({ min: 1970, max: 2000 }).toString()
            },

            company: this.company(),

            address: this.address(),

            address2: this.address2(),

            country: defaults.country ?? 'India',

            state: this.state(),

            city: this.city(),

            zipcode: this.zipcode(),

            mobileNumber: this.mobileNumber()
        };
    }

    // -----------------------------------------------------
    // LOGIN DATA
    // -----------------------------------------------------

    static loginCredentials(email?: string, password?: string): LoginCredentials {

        return {
            email: email ?? this.email(),
            password: password ?? this.password()
        };
    }

    // -----------------------------------------------------
    // PAYMENT DATA
    // -----------------------------------------------------

    static paymentData(): PaymentData {

        return {

            nameOnCard: this.fullName(),

            cardNumber: faker.finance.creditCardNumber('####-####-####-####'),

            cvc: faker.finance.creditCardCVV(),

            expiryMonth: faker.number
                .int({ min: 1, max: 12 })
                .toString()
                .padStart(2, '0'),

            expiryYear: faker.number
                .int({ min: 2027, max: 2035 })
                .toString()
        };
    }

    // -----------------------------------------------------
    // CONTACT US DATA
    // -----------------------------------------------------

    static contactData(): ContactData {

        return {
            name: this.fullName(),
            email: this.email(),
            subject: faker.lorem.sentence(4),
            message: faker.lorem.paragraph()
        };
    }

    // -----------------------------------------------------
    // GENERIC HELPERS
    // -----------------------------------------------------

    static number(min: number, max: number): number {
        return faker.number.int({ min, max });
    }

    static oneOf<T>(items: readonly T[]): T {

        if (items.length === 0) {
            throw new Error('[RandomDataGenerator] oneOf() requires a non-empty list');
        }

        return faker.helpers.arrayElement(items);
    }
}

export default RandomDataGenerator;
