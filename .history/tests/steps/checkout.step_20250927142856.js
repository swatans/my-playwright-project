// tests/steps/checkout.step.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const CheckoutPage = require('../pages/CheckoutPage');
const CheckoutStepTwoPage = require('../pages/CheckoutStepTwoPage');

When('I click Checkout', async function () {
    // assume we are on cart page and "Checkout" button visible
    // try a few known selectors:
    const checkoutBtn = this.page.locator('[data-test="checkout"], #checkout, button[data-test="checkout"], input[name="checkout"]');
    await checkoutBtn.waitFor({ state: 'visible', timeout: 7000 });
    await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'load', timeout: 5000 }).catch(() => { }),
        checkoutBtn.click()
    ]);
});

Then('I should see the checkout form', async function () {
    this.checkoutPage = new CheckoutPage(this.page);
    await this.checkoutPage.waitForVisible(7000);
    const visible = await this.checkoutPage.isVisible();
    assert.ok(visible, 'Checkout form not visible');
});

When('I fill checkout form with:', async function (dataTable) {
    const row = dataTable.rowsHash();
    this.checkoutPage = this.checkoutPage || new CheckoutPage(this.page);
    await this.checkoutPage.fillForm({
        firstName: row.firstName || row['firstName'] || row['First Name'] || '',
        lastName: row.lastName || row['lastName'] || row['Last Name'] || '',
        postalCode: row.postalCode || row['postalCode'] || row['Postal Code'] || row['Zip/Postal Code'] || ''
    });
});

When('I submit checkout', async function () {
    this.checkoutPage = this.checkoutPage || new CheckoutPage(this.page);
    await this.checkoutPage.clickContinue();
});

Then('I should see checkout error message {string}', async function (expected) {
    this.checkoutPage = this.checkoutPage || new CheckoutPage(this.page);
    // small wait for error to appear
    await this.page.waitForTimeout(300); // UI shows red box quickly; minor wait
    const text = await this.checkoutPage.getErrorText();
    assert.ok(text.includes(expected), `Expected error "${expected}", got "${text}"`);
});

Then('I should be on checkout step two', async function () {
    // verify step-two either by URL or page content
    const stepTwo = new CheckoutStepTwoPage(this.page);
    await stepTwo.waitForVisible(7000);
    const items = await stepTwo.getItems();
    assert.ok(Array.isArray(items), 'Checkout step two items not found');
});
