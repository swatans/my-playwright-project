class InventoryPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;
        this.itemList = page.locator('[data-test="inventory-list"] [data-test="inventory-item"]');
        this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
        this.cartLink = page.locator('.shopping_cart_link'); // or [data-test="shopping-cart-link"]
    }

    async goto() {
        await this.page.goto(process.env.BASE_URL || 'https://www.saucedemo.com');
    }

    async addProductByName(name) {
        // find inventory item by the visible name and click add button in its context
        const item = this.page.locator(`.inventory_item:has-text("${name}")`);
        await item.locator('button[data-test^="add-to-cart-"]').first().click();
    }

    async removeProductByName(name) {
        const item = this.page.locator(`.inventory_item:has-text("${name}")`);
        await item.locator('button[data-test^="remove-"]').first().click();
    }

    async getCartBadgeCount() {
        if (await this.cartBadge.count() === 0) return '0';
        return (await this.cartBadge.innerText()).trim();
    }

    async openCart() {
        await this.cartLink.click();
    }
}

module.exports = InventoryPage;
