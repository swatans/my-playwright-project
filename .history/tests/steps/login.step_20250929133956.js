// tests/steps/login.step.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const LoginPage = require('../pages/LoginPage');


When('I login with username {string} and password {string}', async function (username, password) {
    const u = username === '' ? '' : username;
    const p = password === '' ? '' : password;
    const waitTimeout = username === 'performance_glitch_user' ? 30000 : 10000;
    await this.loginPage.login(u, p, { waitTimeout });
});

// Generic text presence check (used by: Then I should see "Products")
Then('I should see {string}', async function (text) {
    // prefer header/title detection first
    const title = this.page.getByText(text, { exact: false });
    const exists = await title.first().isVisible().catch(() => false);
    assert.ok(exists, `Expected to see text "${text}" on the page`);
});

// Error message check (exact match included in feature)
Then('I should see error message {string}', async function (expected) {
    // the error container element on login page
    const err = this.page.locator('.error-message-container');
    const text = await err.innerText().catch(() => '');
    assert.ok(text && text.includes(expected),
        `Expected error message to include "${expected}", but got "${text}"`);
});

// Flexible image-check step: matches both
// "the product images should be displayed correctly"
// and "the product images should be displayed correctly (or assert known glitch)"
Then(/^the product images should be displayed correctly(?: \(or assert known glitch\))?$/, async function () {
    console.log('Checking product images on inventory page...');
    const imgs = this.page.locator('.inventory_item_img img');
    const count = await imgs.count();
    assert.ok(count > 0, 'No product images found on inventory page');

    for (let i = 0; i < count; i++) {
        const img = imgs.nth(i);
        const isVisible = await img.isVisible().catch(() => false);
        assert.ok(isVisible, `Image at index ${i} is not visible`);

        // naturalWidth might be 0 if image broken; check it
        const naturalWidth = await img.evaluate((el) => el.naturalWidth).catch(() => 0);
        assert.ok(naturalWidth > 0, `Product image at index ${i} appears broken (naturalWidth=${naturalWidth})`);
    }
    console.log('Product images check OK');
});

// Wait-for-inventory-within-10s
Then('I should be on the inventory page within 10s', async function () {
    await this.page.waitForURL('**/inventory.html', { timeout: 10000 });
    const ok = await this.loginPage.isOnInventory();
    assert.ok(ok, 'Not on inventory page within 10s');
});

// Screenshot helper
Then('I take a screenshot named {string}', async function (filename) {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const out = `reports/${safeName}`;
    await this.page.screenshot({ path: out, fullPage: true });
    console.log('Saved screenshot:', out);
});
