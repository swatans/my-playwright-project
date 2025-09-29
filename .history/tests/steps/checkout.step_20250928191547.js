const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

When('I click Checkout', async function () {
    await this.page.click('button[data-test="checkout"], .checkout_button');
    await this.page.waitForURL('**/checkout-step-one.html', { timeout: 5000 });
});

Then('I should see the checkout form', async function () {
    const visible = await this.page.locator('#checkout_info_container, [data-test="checkout-info-container"]').isVisible().catch(() => false);
    assert.ok(visible, 'Checkout form not visible');
});

When('I fill checkout form with:', async function (dataTable) {
    const data = dataTable.rowsHash(); // keys: firstName, lastName, postalCode
    if (data.firstName !== undefined) await this.page.fill('input[data-test="firstName"], #first-name', data.firstName || '');
    if (data.lastName !== undefined) await this.page.fill('input[data-test="lastName"], #last-name', data.lastName || '');
    if (data.postalCode !== undefined) await this.page.fill('input[data-test="postalCode"], #postal-code', data.postalCode || '');
});

When('I submit checkout', async function () {
    await this.page.click('input[data-test="continue"], #continue');
});

Then('I should see checkout error message {string}', async function (expected) {
    const el = this.page.locator('.error-message-container').first();
    const txt = await el.textContent().catch(() => '');
    assert.ok(txt.includes(expected), `Expected error "${expected}" but got "${txt}"`);
});

Then('I should be on checkout step two', async function () {
    await this.page.waitForURL('**/checkout-step-two.html', { timeout: 5000 });
    const ok = await this.page.locator('.summary_info, .cart_list, [data-test="checkout-summary"]').isVisible().catch(() => false);
    assert.ok(ok, 'Not on checkout step two page');
});

Then('the checkout summary should contain:', async function (dataTable) {
    // dataTable: rows of { name | price }
    const rows = dataTable.hashes();
    for (const r of rows) {
        const name = r.name.trim();
        const price = r.price.trim();
        const el = await this.page.locator(`.cart_item:has-text("${name}")`).first();
        assert.ok(await el.count() > 0, `Summary missing item ${name}`);
        const p = (await el.locator('.inventory_item_price').textContent()).trim();
        assert.strictEqual(p, price);
    }
});

Then('the summary total should be displayed', async function () {
    const el = this.page.locator('.summary_total_label, .summary_info .summary_total_label').first();
    assert.ok(await el.isVisible(), 'Summary total not displayed');
});

When('I finish the checkout', async function () {
    await this.page.click('button[data-test="finish"], #finish, .cart_button.finish');
    await this.page.waitForURL('**/checkout-complete.html', { timeout: 5000 });
});

Then('I should see the order confirmation (thank you) page', async function () {
    const el = this.page.locator('.complete-header, .checkout_complete_container, .complete-text').first();
    const txt = await el.textContent().catch(() => '');
    assert.ok(txt.toLowerCase().includes('thank'), 'Order confirmation not shown');
});

Then('the cart badge should be empty or not displayed', async function () {
    const count = await this.page.locator('.shopping_cart_badge').count();
    if (count === 0) return; // not present -> OK
    const text = await this.page.locator('.shopping_cart_badge').textContent().catch(() => null);
    assert.ok(!text || text.trim() === '' || text.trim() === '0', 'Cart badge still present after finish');
});
