// tests/steps/cart.step.js
const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const CartPage = require('../pages/CartPage');

When('I add product {string} to cart', async function (productName) {
    // klik tombol Add to cart pada inventory item yang mengandung teks productName
    const item = this.page.locator(`.inventory_item:has-text("${productName}")`).first();
    const addBtn = item.locator('button:has-text("Add to cart"), button[data-test^="add-to-cart-"]').first();
    await addBtn.click();
    await this.page.waitForTimeout(150);
});

Then('the cart badge should show {string}', async function (expected) {
    const badge = this.page.locator('.shopping_cart_badge').first();
    const visible = await badge.isVisible().catch(() => false);
    if (expected === '0') {
        // if expecting zero, badge may be absent or empty
        if (visible) {
            const text = (await badge.textContent())?.trim() || '';
            assert.strictEqual(text, '', 'Expected cart badge to be empty (0) but it has value: ' + text);
        } else {
            // absent -> acceptable as 0
            return;
        }
    } else {
        assert.ok(visible, 'Cart badge not visible');
        const text = (await badge.textContent()).trim();
        assert.strictEqual(text, expected);
    }
});

When('I open the cart page', async function () {
    this.cartPage = new CartPage(this.page);
    await this.cartPage.open();
    const visible = await this.cartPage.isVisible();
    assert.ok(visible, 'Cart page not visible after open()');
});

Then('I should see product {string} with price {string} in the cart', async function (name, price) {
    const items = await this.cartPage.getItems();
    const found = items.find(i => i.name === name && i.price === price);
    assert.ok(found, `Expected to find ${name} with price ${price} in cart. Found: ${JSON.stringify(items)}`);
});

Then('I should be able to remove the product from the cart', async function () {
    const itemsBefore = await this.cartPage.getItems();
    assert.ok(itemsBefore.length > 0, 'No items present to remove');
    const name = itemsBefore[0].name;
    await this.cartPage.removeProductByName(name);
    await this.page.waitForTimeout(300);
    const itemsAfter = await this.cartPage.getItems();
    const still = itemsAfter.find(i => i.name === name);
    assert.ok(!still, `Product ${name} was not removed from cart`);
});

Then('I should see products:', async function (dataTable) {
    const expected = dataTable.hashes().map(r => ({ name: r.name.trim(), price: r.price.trim() }));
    const actual = await this.cartPage.getItems();
    for (const e of expected) {
        const found = actual.find(a => a.name === e.name && a.price === e.price);
        assert.ok(found, `Expected item ${e.name} ${e.price} in cart, actual: ${JSON.stringify(actual)}`);
    }
});

When('I click Checkout', async function () {
    // use CartPage helper
    if (!this.cartPage) this.cartPage = new CartPage(this.page);
    await this.cartPage.clickCheckout();
});
