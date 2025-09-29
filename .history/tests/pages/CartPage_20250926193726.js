class CartPage {
    constructor(page) {
        this.page = page;
        this.cartItems = page.locator('.cart_list .cart_item');
        this.checkoutButton = page.locator('[data-test="checkout"]');
        this.continueShopping = page.locator('[data-test="continue-shopping"]');
    }

    async isVisible() {
        return this.page.locator('[data-test="cart-contents-container"]').isVisible();
    }

    async getItems() {
        const count = await this.cartItems.count();
        const out = [];
        for (let i = 0; i < count; i++) {
            const row = this.cartItems.nth(i);
            const name = (await row.locator('[data-test="inventory-item-name"]').innerText()).trim();
            const price = (await row.locator('[data-test="inventory-item-price"]').innerText()).trim();
            const qty = (await row.locator('[data-test="item-quantity"]').innerText()).trim().catch(() => '1');
            out.push({ name, price, qty });
        }
        return out;
    }

    async hasProduct(name, price) {
        const item = this.page.locator(`.cart_item:has-text("${name}")`);
        if (await item.count() === 0) return false;
        if (price) {
            const p = (await item.locator('[data-test="inventory-item-price"]').innerText()).trim();
            return p === price;
        }
        return true;
    }

    async removeProduct(name) {
        const item = this.page.locator(`.cart_item:has-text("${name}")`);
        await item.locator('button[data-test^="remove-"]').click();
    }

    async clickCheckout() {
        await this.checkoutButton.click();
    }
}

module.exports = CartPage;
