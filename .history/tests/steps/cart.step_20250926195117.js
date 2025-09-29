// tests/steps/cart.step.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const InventoryPage = require('../pages/InventoryPage');
const CartPage = require('../pages/CartPage');


When('I add product {string} to cart', async function (productName) {
    // Ensure inventoryPage exists (defensive)
    if (!this.inventoryPage) this.inventoryPage = new InventoryPage(this.page);

    // wait inventory list ready
    await this.page.waitForSelector('[data-test="inventory-list"]', { timeout: 10000 });

    // perform add
    await this.inventoryPage.addProductByName(productName);

    // small wait for UI update (badge/count)
    await this.page.waitForTimeout(250);
});

Then('the cart badge should show {string}', async function (expected) {
    if (!this.inventoryPage) this.inventoryPage = new InventoryPage(this.page);
    const count = await this.inventoryPage.getCartBadgeCount();
    assert.strictEqual(count, expected);
});

When('I open the cart page', async function () {
    if (!this.inventoryPage) this.inventoryPage = new InventoryPage(this.page);
    await this.inventoryPage.openCart();
    this.cartPage = new (require('../pages/CartPage'))(this.page);
    await this.page.waitForSelector('[data-test="cart-contents-container"]', { timeout: 10000 });
});

Then('I should see product {string} with price {string} in the cart', async function (name, price) {
    if (!this.cartPage) this.cartPage = new (require('../pages/CartPage'))(this.page);
    const ok = await this.cartPage.hasProduct(name, price);
    assert.ok(ok, `Expected product ${name} with price ${price} in cart`);
});

Then('I should be able to remove the product from the cart', async function () {
    if (!this.cartPage) this.cartPage = new (require('../pages/CartPage'))(this.page);
    const itemsBefore = await this.cartPage.getItems();
    assert.ok(itemsBefore.length > 0, 'No items to remove');
    const name = itemsBefore[0].name;
    await this.cartPage.removeProduct(name);
    await this.page.waitForTimeout(300);
    const still = await this.cartPage.hasProduct(name);
    assert.strictEqual(still, false, 'Item not removed from cart');
});

// table matcher and checkout steps (optional, keep from previous snippet)
Then('I should see products:', async function (dataTable) {
    if (!this.cartPage) this.cartPage = new (require('../pages/CartPage'))(this.page);
    const expected = dataTable.hashes();
    const items = await this.cartPage.getItems();
    for (const row of expected) {
        const found = items.find(i => i.name === row.name && i.price === row.price);
        assert.ok(found, `Missing expected product ${row.name} (${row.price})`);
    }
});

When('I click Checkout', async function () {
    if (!this.cartPage) this.cartPage = new (require('../pages/CartPage'))(this.page);
    await this.cartPage.clickCheckout();
});

Then('I should see the checkout form', async function () {
    // check for common checkout selectors
    const seen = await this.page.locator('input[id="first-name"], #checkout_info_container, text=Checkout: Your Information').first().isVisible().catch(() => false);
    assert.ok(seen, 'Checkout form not visible');
});
