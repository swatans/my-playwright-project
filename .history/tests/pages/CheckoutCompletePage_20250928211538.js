class CheckoutCompletePage {
    constructor(page) {
        this.page = page;
        this.container = page.locator('[data-test="checkout-complete-container"], .checkout_complete_container');
        this.pony = page.locator('[data-test="pony-express"], .pony_express');
        this.header = page.locator('[data-test="complete-header"], .complete-header');
        this.text = page.locator('[data-test="complete-text"], .complete-text');
        this.backBtn = page.locator('button[data-test="back-to-products"], #back-to-products, button[name="back-to-products"]');
    }

    async isVisible() {
        return this.container.isVisible();
    }

    async headerText() {
        return (await this.header.textContent()).trim();
    }

    async bodyText() {
        return (await this.text.textContent()).trim();
    }

    async hasPonyImage() {
        return (await this.pony.count()) > 0;
    }

    async clickBackToProducts() {
        await this.backBtn.click();
    }
}

module.exports = CheckoutCompletePage;
