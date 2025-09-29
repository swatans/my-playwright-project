// tests/steps/cart.step.js
const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const CartPage = require('../pages/CartPage');

When('I add product {string} to cart', async function (name) {
    if (!this.cartPage) this.cartPage = new CartPage(this.page);
    await this.cartPage.addProductByName(name);
});

Then('the cart badge should show {string}', async function (expected) {
    if (!this.cartPage) this.cartPage = new CartPage(this.page);
    const txt = await this.cartPage.getCartBadgeText();
    const actual = (txt === null) ? '0' : txt;
    assert.strictEqual(actual, expected);
});

When('I open the cart page', async function () {
    if (!this.cartPage) this.cartPage = new CartPage(this.page);
    await this.cartPage.openCart();
});

Then('I should see product {string} with price {string} in the cart', async function (name, price) {
    if (!this.cartPage) this.cartPage = new CartPage(this.page);
    const items = await this.cartPage.getItems();
    const found = items.find(i => i.name === name && i.price === price);
    assert.ok(found, `Expected to find ${name} ${price} in cart. Found: ${JSON.stringify(items)}`);
});

// NEW: verify multiple products via DataTable
Then('I should see products:', async function (dataTable) {
    if (!this.cartPage) this.cartPage = new CartPage(this.page);
    // dataTable has header columns: name | price
    const expected = dataTable.hashes().map(r => ({ name: r.name.trim(), price: r.price.trim() }));
    const actual = await this.cartPage.getItems();
    for (const e of expected) {
        const found = actual.find(a => a.name === e.name && a.price === e.price);
        assert.ok(found, `Expected item ${e.name} ${e.price} in cart, actual: ${JSON.stringify(actual)}`);
    }
});

// NEW: remove a product (implementasi yang dipakai di feature)
Then('I should be able to remove the product from the cart', async function () {
    if (!this.cartPage) this.cartPage = new CartPage(this.page);
    const itemsBefore = await this.cartPage.getItems();
    assert.ok(itemsBefore.length > 0, 'No items present to remove');
    const name = itemsBefore[0].name;
    await this.cartPage.removeProductByName(name);
    // wait small time for UI to update
    await this.page.waitForTimeout(300);
    const itemsAfter = await this.cartPage.getItems();
    const still = itemsAfter.find(i => i.name === name);
    assert.ok(!still, `Product ${name} was not removed from cart`);
});

When('I click Checkout', async function () {
    if (!this.cartPage) this.cartPage = new CartPage(this.page);
    await this.cartPage.clickCheckout();
});

Then('I should see the checkout form', async function () {
    const visible = await this.page.locator('#checkout_info_container, [data-test="checkout-info-container"]').isVisible().catch(() => false);
    assert.ok(visible, 'Checkout form not visible');
});
