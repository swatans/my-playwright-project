const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const InventoryPage = require('../pages/InventoryPage');
const LoginPage = require('../pages/LoginPage');

Given('I open the Saucedemo login page', async function () {
    this.loginPage = this.loginPage || new LoginPage(this.page);
    await this.loginPage.goto();
});

Then('I should be on the inventory page', async function () {
    this.inventoryPage = this.inventoryPage || new InventoryPage(this.page);
    const ok = await this.inventoryPage.pageIsInventory?.() || (await this.page.url()).includes('/inventory.html') || (await this.page.locator('text=Products').count() > 0);
    assert.ok(ok, 'Not on inventory page');
});

// --- Homepage specific steps

Then('all product names start with {string}', async function (prefix) {
    // read all product name elements
    const names = this.page.locator('.inventory_item_name, .inventory_item_name a, .inventory_item .inventory_item_name');
    const count = await names.count();
    assert.ok(count > 0, 'No products found on homepage');
    for (let i = 0; i < count; i++) {
        const txt = (await names.nth(i).textContent()).trim();
        assert.ok(txt.startsWith(prefix), `Product name "${txt}" does not start with "${prefix}"`);
    }
});

Then('all product prices have format "$XX.XX"', async function () {
    const prices = this.page.locator('.inventory_item_price, .inventory_item .pricebar .inventory_item_price, .inventory_item .inventory_item_price');
    const count = await prices.count();
    assert.ok(count > 0, 'No product prices found');
    const re = /^\$\d+\.\d{2}$/;
    for (let i = 0; i < count; i++) {
        const txt = (await prices.nth(i).textContent()).trim();
        assert.ok(re.test(txt), `Price "${txt}" does not match $XX.XX`);
    }
});

When('I open the product detail page for {string}', async function (name) {
    const item = this.page.locator(`.inventory_item:has-text("${name}")`).first();
    assert.ok(await item.count() > 0, `Product ${name} not found`);
    // click product title or image
    await item.locator('.inventory_item_name, a.inventory_item_link, .inventory_item_img, img').first().click().catch(async () => {
        // fallback to click title text
        await this.page.click(`text="${name}"`).catch(() => null);
    });
    // wait for PDP text
    await this.page.waitForLoadState('networkidle').catch(() => null);
});

Then('I should see product name {string} on the PDP', async function (name) {
    const header = this.page.locator('.inventory_details_name, .product_label, .inventory_details_name.large_title, .inventory_item_name');
    assert.ok(await header.count() > 0, 'PDP header not found');
    const txt = (await header.first().textContent()).trim();
    assert.strictEqual(txt, name);
});

When('I sort products by {string}', async function (option) {
    // the select typically has data-test="product_sort_container"
    const sel = this.page.locator('[data-test="product_sort_container"], select.product_sort_container, select#sort');
    assert.ok(await sel.count() > 0, 'Sort select not found');
    // determine value by label heuristics
    const label = option.toLowerCase();
    let value = '';
    if (label.includes('name') && label.includes('a to z')) value = 'az';
    if (label.includes('name') && label.includes('z to a')) value = 'za';
    if (label.includes('low') && label.includes('high')) value = 'lohi';
    if (label.includes('high') && label.includes('low')) value = 'hilo';
    // try to select by visible text when value unknown
    if (value) {
        // try common values used by saucedemo
        await sel.selectOption({ label: option }).catch(() => sel.selectOption(value).catch(() => null));
    } else {
        await sel.selectOption({ label: option }).catch(() => sel.selectOption(option).catch(() => null));
    }
    // small wait for UI update
    await this.page.waitForTimeout(300);
});

Then('products are sorted alphabetically ascending', async function () {
    const names = this.page.locator('.inventory_item_name');
    const count = await names.count();
    const arr = [];
    for (let i = 0; i < count; i++) arr.push((await names.nth(i).textContent()).trim());
    const sorted = [...arr].sort((a, b) => a.localeCompare(b));
    assert.deepStrictEqual(arr, sorted, `Products not sorted ascending. Found: ${arr.join(', ')}`);
});

Then('products are sorted by price ascending', async function () {
    const prices = this.page.locator('.inventory_item_price');
    const count = await prices.count();
    const arr = [];
    for (let i = 0; i < count; i++) {
        const txt = (await prices.nth(i).textContent()).trim().replace('$', '');
        arr.push(parseFloat(txt));
    }
    const sorted = [...arr].sort((a, b) => a - b);
    assert.deepStrictEqual(arr, sorted, `Prices not sorted ascending. Found: ${arr.join(', ')}`);
});

When('I refresh the page', async function () {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle').catch(() => null);
});
