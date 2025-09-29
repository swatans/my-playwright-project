const { Then, When } = require('@cucumber/cucumber');
const assert = require('assert');
const CheckoutCompletePage = require('../pages/CheckoutCompletePage');

Then('I should see the order confirmation (thank you) page', async function () {
    this.checkoutComplete = this.checkoutComplete || new CheckoutCompletePage(this.page);

    // tunggu container muncul
    const ok = await this.checkoutComplete.container.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
    assert.ok(ok, 'Checkout-complete container not visible');

    // cek header text & body text
    const header = (await this.checkoutComplete.headerText()).toLowerCase();
    const body = (await this.checkoutComplete.bodyText()).toLowerCase();

    assert.ok(header.includes('thank') || header.includes('thank you') || header.includes('complete'), `Header tidak mengandung kata kunci: "${header}"`);
    assert.ok(body.length > 0, 'Complete text kosong');

    // cek pony image optional
    const hasPony = await this.checkoutComplete.hasPonyImage().catch(() => false);
    assert.ok(hasPony, 'Pony image not found (optional check)');
});

When('I click Back Home on the order confirmation page', async function () {
    this.checkoutComplete = this.checkoutComplete || new CheckoutCompletePage(this.page);
    await this.checkoutComplete.clickBackToProducts();
    // tunggu redirect ke inventory (optional)
    await this.page.waitForURL('**/inventory.html', { timeout: 5000 }).catch(() => null);
});
