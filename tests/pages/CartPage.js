// tests/pages/CartPage.js
class CartPage {
    constructor(page) {
        this.page = page;
        // selectors yang robust (menggunakan data-test bila tersedia)
        this.selectors = {
            cartContainer: '[data-test="cart-contents-container"], #cart_contents_container',
            cartItems: '.cart_list .cart_item, .cart_item',
            itemName: '[data-test="inventory-item-name"], .inventory_item_name',
            itemPrice: '[data-test="inventory-item-price"], .inventory_item_price',
            itemQty: '[data-test="item-quantity"], .cart_quantity',
            removeButton: 'button[data-test^="remove-"], .cart_button, button.btn_secondary',
            checkoutButton: '[data-test="checkout"], #checkout, .checkout_button',
            cartLink: '[data-test="shopping-cart-link"], .shopping_cart_link, #shopping_cart_container a'
        };
    }

    // buka halaman cart — klik icon cart atau langsung ke /cart.html
    async open() {
        // coba klik cart link dulu
        await this.page.locator(this.selectors.cartLink).first().click().catch(() => null);
        // fallback: go to url
        try {
            await this.page.waitForSelector(this.selectors.cartContainer, { timeout: 2000 });
        } catch (e) {
            // try direct url
            await this.page.goto('https://www.saucedemo.com/cart.html').catch(() => null);
            await this.page.waitForSelector(this.selectors.cartContainer, { timeout: 5000 });
        }
    }

    async isVisible() {
        return this.page.locator(this.selectors.cartContainer).first().isVisible().catch(() => false);
    }

    // kembalikan array { name, price, qty }
    async getItems() {
        const out = [];
        const locator = this.page.locator(this.selectors.cartItems);
        const count = await locator.count();
        for (let i = 0; i < count; i++) {
            const item = locator.nth(i);
            const nameRaw = await item.locator(this.selectors.itemName).textContent().catch(() => '');
            const priceRaw = await item.locator(this.selectors.itemPrice).textContent().catch(() => '');
            const qtyRaw = await item.locator(this.selectors.itemQty).textContent().catch(() => '1');
            const name = (nameRaw || '').trim();
            const price = (priceRaw || '').trim();
            const qty = (qtyRaw || '').trim();
            out.push({ name, price, qty });
        }
        return out;
    }

    async hasProduct(name, price) {
        const items = await this.getItems();
        return items.some(i => i.name === name && (!price || i.price === price));
    }

    async removeProductByName(name) {
        const item = this.page.locator(`${this.selectors.cartItems}:has-text("${name}")`).first();
        if ((await item.count()) === 0) throw new Error(`Product ${name} not found in cart`);
        const btn = item.locator(this.selectors.removeButton).first();
        await btn.click();
        // wait small time for UI change
        await this.page.waitForTimeout(200);
    }

    async clickCheckout() {
        await this.page.locator(this.selectors.checkoutButton).first().click();
    }
}

module.exports = CartPage;
