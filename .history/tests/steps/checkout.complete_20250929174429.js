const { Then, When } = require('@cucumber/cucumber');
const assert = require('assert');
const CheckoutCompletePage = require('../pages/CheckoutCompletePage');



When('I click Back Home on the order confirmation page', async function () {
    this.checkoutComplete = this.checkoutComplete || new CheckoutCompletePage(this.page);
    await this.checkoutComplete.clickBackToProducts();
    // tunggu redirect ke inventory (optional)
    await this.page.waitForURL('**/inventory.html', { timeout: 5000 }).catch(() => null);
});
