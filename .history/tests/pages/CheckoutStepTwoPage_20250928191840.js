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
        const els = this.page.locator('.cart_item');
        const n = await els.count();
        const items = [];
        for (let i = 0; i < n; i++) {
            const el = els.nth(i);
            const name = (await el.locator('.inventory_item_name').textContent()).trim();
            const price = (await el.locator('.inventory_item_price').textContent()).trim();
            items.push({ name, price });
        }
        return items;
    }


    async getTotalText() {
        return (await this.totalLabel.innerText().catch(() => '')).trim();
    }
}

module.exports = CheckoutStepTwoPage;
