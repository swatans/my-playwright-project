// tests/steps/checkout.step.js
const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const CheckoutCompletePage = require('../pages/CheckoutCompletePage');

function parseFlexibleDataTable(dataTable) {
    try {
        return dataTable.rowsHash();
    } catch (e) {
        const rows = dataTable.rows();
        if (rows.length >= 2) {
            const headers = rows[0].map(h => h.trim());
            const values = rows[1];
            const out = {};
            for (let i = 0; i < headers.length; i++) {
                out[headers[i]] = (values[i] !== undefined) ? values[i] : '';
            }
            return out;
        }
        return {};
    }
}

When('I fill checkout form with:', async function (dataTable) {
    const data = parseFlexibleDataTable(dataTable);
    if (data.firstName !== undefined) {
        await this.page.fill('input[data-test="firstName"], #first-name', String(data.firstName));
    }
    if (data.lastName !== undefined) {
        await this.page.fill('input[data-test="lastName"], #last-name', String(data.lastName));
    }
    if (data.postalCode !== undefined) {
        await this.page.fill('input[data-test="postalCode"], #postal-code', String(data.postalCode));
    }
});

When('I submit checkout', async function () {
    // click Continue and wait for either navigation to step-two OR an error visible
    await this.page.click('input[data-test="continue"], #continue').catch(() => null);

    // race between navigation or error
    const navPromise = this.page.waitForURL('**/checkout-step-two.html', { timeout: 7000 }).catch(() => null);
    const errorPromise = this.page.locator('.error-message-container, .error-message').waitFor({ state: 'visible', timeout: 7000 }).catch(() => null);

    await Promise.race([navPromise, errorPromise]);
});

Then('I should see checkout error message {string}', async function (expected) {
    const el = this.page.locator('.error-message-container, .error-message').first();
    const txt = (await el.textContent().catch(() => '')).trim();
    assert.ok(txt.includes(expected), `Expected error "${expected}" but got "${txt}"`);
});

Then('I should be on checkout step two', async function () {
    // allow URL or presence of summary container
    const url = this.page.url();
    if (url.includes('checkout-step-two.html')) return;

    await this.page.waitForURL('**/checkout-step-two.html', { timeout: 7000 }).catch(() => null);

    const ok = await this.page.locator('.cart_list, .summary_info, [data-test="checkout-summary"], .checkout_summary_container').first().isVisible().catch(() => false);
    assert.ok(ok, 'Not on checkout step two page');
});

Then('the checkout summary should contain:', async function (dataTable) {
    const rows = dataTable.hashes();
    for (const r of rows) {
        const name = r.name.trim();
        const price = r.price.trim();
        const el = this.page.locator(`.cart_item:has-text("${name}")`).first();
        assert.ok(await el.count() > 0, `Summary missing item ${name}`);
        const p = (await el.locator('.inventory_item_price').textContent()).trim();
        assert.strictEqual(p, price);
    }
});

Then('the summary total should be displayed', async function () {
    const el = this.page.locator('.summary_total_label, .summary_subtotal_label, .summary_info .summary_total_label').first();
    assert.ok(await el.isVisible().catch(() => false), 'Summary total not displayed');
});

When('I finish the checkout', async function () {
    await this.page.click('button[data-test="finish"], #finish, .cart_button.finish').catch(() => null);
    // try wait for complete url, but not fail hard if single-page flow
    await this.page.waitForURL('**/checkout-complete.html', { timeout: 7000 }).catch(() => null);
});

Then('the cart badge should be empty or not displayed', async function () {
    const count = await this.page.locator('.shopping_cart_badge').count();
    if (count === 0) return;
    const text = (await this.page.locator('.shopping_cart_badge').textContent().catch(() => '')).trim();
    assert.ok(!text || text === '' || text === '0', 'Cart badge still present after finish');
});

/* Checkout form visibility */
Then('I should see the checkout form', async function () {
    const form = this.page.locator('[data-test="checkout-info-container"], #checkout_info_container');
    const title = this.page.locator('.title[data-test="title"], .header_secondary_container .title');
    const formVisible = await form.isVisible().catch(() => false);
    const titleText = (await title.textContent().catch(() => '')).toLowerCase();
    const ok = formVisible || titleText.includes('checkout');
    assert.ok(ok, 'Checkout form not visible');
});

When('I click Back Home on the order confirmation page', async function () {
    this.checkoutComplete = this.checkoutComplete || new CheckoutCompletePage(this.page);
    await this.checkoutComplete.clickBackToProducts();
    await this.page.waitForURL('**/inventory.html', { timeout: 5000 }).catch(() => null);
});
