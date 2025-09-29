const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

When('I add product {string} to cart', async function (name) {
    const btn = this.page.locator(`.inventory_item:has-text("${name}") button`).first();
    await btn.waitFor({ state: 'visible', timeout: 5000 });
    await btn.click();
});

Then('the cart badge should show {string}', async function (expected) {
    const badgeEl = this.page.locator('.shopping_cart_badge').first();
    const text = await badgeEl.textContent().catch(() => null);
    const actual = text ? text.trim() : '0';
    assert.strictEqual(actual, expected);
});

When('I open the cart page', async function () {
    await this.page.click('.shopping_cart_link');
    await this.page.waitForURL('**/cart.html', { timeout: 5000 });
});

Then('I should see product {string} with price {string} in the cart', async function (name, price) {
    const item = this.page.locator(`.cart_item:has-text("${name}")`).first();
    assert.ok(await item.count() > 0, `Product ${name} not found in cart`);
    const p = (await item.locator('.inventory_item_price').textContent()).trim();
    assert.strictEqual(p, price);
});
