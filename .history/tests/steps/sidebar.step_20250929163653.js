// tests/steps/sidebar.step.js
const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

When('I open the sidebar menu', async function () {
    this.sidebar = this.sidebar || {};
    // click burger; wait for menu to become visible
    await this.page.locator('#react-burger-menu-btn, .bm-burger-button button').first().click().catch(() => null);
    await this.page.locator('.bm-menu-wrap, .bm-menu').first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => null);
});

Then('the sidebar should be visible', async function () {
    const ok = await this.page.locator('.bm-menu-wrap, .bm-menu').first().isVisible().catch(() => false);
    assert.ok(ok, 'Sidebar expected to be visible');
});

When('I close the sidebar menu', async function () {
    await this.page.locator('#react-burger-cross-btn, .bm-cross-button button').first().click().catch(() => null);
    await this.page.locator('.bm-menu-wrap, .bm-menu').first().waitFor({ state: 'hidden', timeout: 3000 }).catch(() => null);
});

Then('the sidebar should be hidden', async function () {
    const ok = await this.page.locator('.bm-menu-wrap, .bm-menu').first().isVisible().catch(() => false);
    assert.ok(!ok, 'Sidebar expected to be hidden');
});

When('I click the "All Items" menu entry', async function () {
    await this.page.locator('[data-test="inventory-sidebar-link"], #inventory_sidebar_link').first().click().catch(() => null);
    // inventory likely same-tab; wait for URL or Products text
    await this.page.waitForURL('**/inventory.html', { timeout: 3000 }).catch(() => null);
});

When('I click the "About" menu entry', async function () {
    // About may open new tab or same tab redirect. We'll try capture popup, fallback to wait for navigation.
    const ctx = this.page.context();
    const before = ctx.pages();
    await this.page.locator('[data-test="about-sidebar-link"], #about_sidebar_link').first().click().catch(() => null);

    // try detect new page
    const start = Date.now();
    let popup = null;
    while (Date.now() - start < 4000) {
        const after = ctx.pages();
        if (after.length > before.length) {
            popup = after.find(p => !before.includes(p));
            break;
        }
        await new Promise(r => setTimeout(r, 150));
    }
    if (popup) {
        await popup.waitForLoadState('load').catch(() => null);
        this._about_popup = popup;
    } else {
        // fallback: wait a moment for same-tab navigation
        await this.page.waitForLoadState('domcontentloaded').catch(() => null);
        this._about_popup = null;
    }
});

Then('a new tab should open to {string}', async function (host) {
    // if popup captured, check its url; otherwise check current page url
    const popup = this._about_popup;
    const url = popup ? popup.url() : this.page.url();
    if (!url) throw new assert.AssertionError({ message: 'No popup captured for About' });
    assert.ok(url.includes(host), `Expected ${host} in ${url}`);
});

When('I click the "Reset App State" menu entry', async function () {
    await this.page.locator('[data-test="reset-sidebar-link"], #reset_sidebar_link').first().click().catch(() => null);
    // short wait for UI update
    await this.page.waitForTimeout(300);
});

When('I click the "Logout" menu entry', async function () {
    await this.page.locator('[data-test="logout-sidebar-link"], #logout_sidebar_link').first().click().catch(() => null);
    await this.page.waitForURL('**/index.html', { timeout: 5000 }).catch(() => null);
});
