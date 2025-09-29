// tests/pages/CheckoutStepTwoPage.js
class CheckoutStepTwoPage {
    constructor(page) {
        this.page = page;
        this.container = page.locator('#checkout_summary_container, [data-test="checkout-summary-container"]');
        this.items = page.locator('.cart_list .cart_item, .cart_item'); // each cart item
        this.itemName = (item) => item.locator('.inventory_item_name, .cart_item_label .inventory_item_name');
        this.itemPrice = (item) => item.locator('.inventory_item_price, .item_pricebar .inventory_item_price');
        this.finishBtn = page.locator('[data-test="finish"], #finish, input[name="finish"]');
        this.totalLabel = page.locator('.summary_total_label');
    }

    async waitForVisible(timeout = 7000) {
        await this.container.waitFor({ state: 'visible', timeout });
    }

    async getItems() {
        const count = await this.items.count();
        const results = [];
        for (let i = 0; i < count; i++) {
            const item = this.items.nth(i);
            const name = (await this.itemName(item).innerText()).trim();
            const price = (await this.itemPrice(item).innerText()).trim();
            results.push({ name, price });
        }
        return results;
    }

    async getTotalText() {
        return (await this.totalLabel.innerText().catch(() => '')).trim();
    }
}

module.exports = CheckoutStepTwoPage;
