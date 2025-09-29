const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const InventoryPage = require('../pages/InventoryPage');
const CartPage = require('../pages/CartPage');

Given('I open the Saucedemo login page', async function () {
    this.inventoryPage = new InventoryPage(this.page);
    await this.inventoryPage.goto();
});

When('I add product {string} to cart', async function (productName) {
    // wait inventory to be visible and add
    await this.page.waitForSelector('[data-test="inventory-list"]', { timeout: 10000 });
    await this.inventoryPage.addProductByName(productName);
    // small wait for UI update
    await this.page.waitForTimeout(300);
});

Then('the cart badge should show {string}', async function (expected) {
    const count = await this.inventoryPage.getCartBadgeCount();
    assert.strictEqual(count, expected);
});

When('I open the cart page', async function () {
    await this.inventoryPage.openCart();
    // set cart page instance
    this.cartPage = new (require('../pages/CartPage'))(this.page);
    // wait for cart page container
    await this.page.waitForSelector('[data-test="cart-contents-container"]', { timeout: 10000 });
});

Then('I should see product {string} with price {string} in the cart', async function (name, price) {
    assert.ok(this.cartPage, 'CartPage not initialized');
    const ok = await this.cartPage.hasProduct(name, price);
    assert.ok(ok, `Expected to find product ${name} with price ${price} in cart`);
});

Then('I should be able to remove the product from the cart', async function () {
    const itemsBefore = await this.cartPage.getItems();
    assert.ok(itemsBefore.length > 0, 'No items to remove');
    const name = itemsBefore[0].name;
    await this.cartPage.removeProduct(name);
    // wait and assert it's gone
    await this.page.waitForTimeout(300);
    const still = await this.cartPage.hasProduct(name);
    assert.strictEqual(still, false, 'Item not removed from cart');
});

Then('I should see products:', async function (dataTable) {
    const expected = dataTable.hashes(); // [{name,price}, ...]
    const items = await this.cartPage.getItems();
    for (const row of expected) {
        const found = items.find(i => i.name === row.name && i.price === row.price);
        assert.ok(found, `Missing expected product ${row.name} (${row.price})`);
    }
});

When('I click Checkout', async function () {
    await this.cartPage.clickCheckout();
});

Then('I should see the checkout form', async function () {
    // checkout form id/class: look for input fields
    await this.page.waitForSelector('#checkout_info_container, [data-test="checkout"]', { timeout: 10000 }).catch(() => null);
    // Better: check for first name input or title
    const seen = await this.page.locator('text=Checkout: Your Information, #checkout_info_container, input[id="first-name"]').first().isVisible().catch(() => false);
    assert.ok(seen, 'Checkout form not visible');
});
