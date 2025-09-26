// tests/steps/login.step.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const LoginPage = require('../pages/LoginPage');

Given('I open the Saucedemo login page', async function () {
    this.loginPage = new LoginPage(this.page);
    await this.loginPage.goto();
});

When('I login with username {string} and password {string}', async function (username, password) {
    // treat empty string as intentionally empty input
    const u = username === '' ? '' : username;
    const p = password === '' ? '' : password;

    // give longer wait for performance_glitch_user
    const waitTimeout = username === 'performance_glitch_user' ? 30000 : 10000;
    await this.loginPage.login(u, p, { waitTimeout });
});

Then('I should be on the inventory page', async function () {
    const ok = await this.loginPage.isOnInventory();
    assert.ok(ok, 'Not on inventory page');
});

Then('I should see {string}', async function (text) {
    // generic text presence check on page (case-sensitive-ish). Use visible check.
    const locator = this.page.getByText(text, { exact: false });
    const visible = await locator.first().isVisible().catch(() => false);
    assert.ok(visible, `Expected to see text "${text}" on the page`);
});

Then('the product images should be displayed correctly (or assert known glitch)', async function () {
    // check that product images exist and are not broken (naturalWidth > 0)
    const imgs = this.page.locator('.inventory_item_img img');
    const count = await imgs.count();
    assert.ok(count > 0, 'No product images found on inventory page');

    for (let i = 0; i < count; i++) {
        const img = imgs.nth(i);
        // ensure visible
        const isVisible = await img.isVisible().catch(() => false);
        assert.ok(isVisible, `Image at index ${i} is not visible`);

        // check naturalWidth via evaluate
        const naturalWidth = await img.evaluate((el) => el.naturalWidth).catch(() => 0);
        assert.ok(naturalWidth > 0, `Product image at index ${i} appears broken (naturalWidth=${naturalWidth})`);
    }
});

Then('I should be on the inventory page within 10s', async function () {
    // explicit wait for inventory URL/title
    await this.page.waitForURL('**/inventory.html', { timeout: 10000 });
    const ok = await this.loginPage.isOnInventory();
    assert.ok(ok, 'Not on inventory page within 10s');
});

Then('I take a screenshot named {string}', async function (filename) {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const out = `reports/${safeName}`;
    await this.page.screenshot({ path: out, fullPage: true });
    console.log('Saved screenshot:', out);
});
