// tests/steps/sidebar.step.js
const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const SidebarPage = require('../pages/SidebarPage');

function ensureSidebar(world) {
    if (!world.sidebar) world.sidebar = new SidebarPage(world.page);
    return world.sidebar;
}

When('I open the sidebar menu', async function () {
    const sidebar = ensureSidebar(this);
    // use page-level fallback if SidebarPage.open missing
    if (typeof sidebar.open === 'function') {
        await sidebar.open();
    } else {
        await this.page.locator('#react-burger-menu-btn, .bm-burger-button button').first().click().catch(() => null);
        await this.page.waitForTimeout(200);
    }
});

Then('the sidebar should be visible', async function () {
    const sidebar = ensureSidebar(this);
    const ok = (typeof sidebar.isVisible === 'function')
        ? await sidebar.isVisible()
        : await this.page.locator('.bm-menu-wrap, .bm-menu').first().isVisible().catch(() => false);
    assert.ok(ok, 'Sidebar expected to be visible');
});

When('I close the sidebar menu', async function () {
    const sidebar = ensureSidebar(this);
    if (typeof sidebar.close === 'function') {
        await sidebar.close();
    } else {
        await this.page.locator('#react-burger-cross-btn, .bm-cross-button button').first().click().catch(() => null);
        await this.page.waitForTimeout(150);
    }
});

Then('the sidebar should be hidden', async function () {
    const sidebar = ensureSidebar(this);
    const ok = (typeof sidebar.isVisible === 'function')
        ? await sidebar.isVisible()
        : await this.page.locator('.bm-menu-wrap, .bm-menu').first().isVisible().catch(() => false);
    assert.ok(!ok, 'Sidebar expected to be hidden');
});

// Specific menu entries (All Items / About / Reset App State / Logout)
When('I click the "All Items" menu entry', async function () {
    const sidebar = ensureSidebar(this);
    if (typeof sidebar.clickAllItems === 'function') {
        await sidebar.clickAllItems();
    } else {
        await this.page.locator('[data-test="inventory-sidebar-link"], #inventory_sidebar_link').first().click().catch(() => null);
    }
    // wait for inventory page visible (best-effort)
    await this.page.waitForURL('**/inventory.html', { timeout: 3000 }).catch(() => { });
});

When('I click the "About" menu entry', async function () {
    const sidebar = ensureSidebar(this);
    // capture result into this._aboutPopup (consistent name)
    let result = null;
    if (typeof sidebar.clickAboutAndWaitForPopup === 'function') {
        result = await sidebar.clickAboutAndWaitForPopup().catch(() => null);
    } else {
        // fallback: click and try to capture popup via context pages
        const ctx = this.page.context();
        const before = ctx.pages().slice();
        await this.page.locator('[data-test="about-sidebar-link"], #about_sidebar_link').first().click().catch(() => null);
        // short poll for new page
        const start = Date.now();
        while (Date.now() - start < 5000) {
            const after = ctx.pages();
            if (after.length > before.length) {
                const newPage = after.find(p => !before.includes(p));
                if (newPage) {
                    await newPage.waitForLoadState('load').catch(() => null);
                    result = { popup: newPage, url: newPage.url() };
                    break;
                }
            }
            await new Promise(r => setTimeout(r, 150));
        }
    }
    this._aboutPopup = result || null;
});

Then('a new tab should open to {string}', async function (host) {
    // use this._aboutPopup consistently
    assert.ok(this._aboutPopup, 'No popup captured for About');
    // support both forms: { popup, url } or direct Page object
    let url = '';
    if (this._aboutPopup.url) url = this._aboutPopup.url;
    else if (this._aboutPopup.popup && typeof this._aboutPopup.popup.url === 'function') {
        url = this._aboutPopup.popup.url();
    } else if (typeof this._aboutPopup === 'string') {
        url = this._aboutPopup;
    } else if (this._aboutPopup instanceof Object && this._aboutPopup.popup) {
        try { url = this._aboutPopup.popup.url(); } catch (e) { url = ''; }
    }
    assert.ok(url && url.includes(host), `Expected popup url to include "${host}", got "${url}"`);
});

When('I click the "Reset App State" menu entry', async function () {
    const sidebar = ensureSidebar(this);
    if (typeof sidebar.clickReset === 'function') {
        await sidebar.clickReset();
    } else if (typeof sidebar.clickResetAppState === 'function') {
        await sidebar.clickResetAppState();
    } else {
        await this.page.locator('[data-test="reset-sidebar-link"], #reset_sidebar_link').first().click().catch(() => null);
    }
    await this.page.waitForTimeout(300);
});

When('I click the "Logout" menu entry', async function () {
    const sidebar = ensureSidebar(this);
    if (typeof sidebar.clickLogout === 'function') {
        await sidebar.clickLogout();
    } else {
        await this.page.locator('[data-test="logout-sidebar-link"], #logout_sidebar_link').first().click().catch(() => null);
    }
    await this.page.waitForURL('**/index.html', { timeout: 5000 }).catch(() => { });
});

Then('I should see the login page', async function () {
    const uname = this.page.locator('[data-test="username"], #user-name');
    const pass = this.page.locator('[data-test="password"], #password');
    const have = (await uname.count() > 0) && (await pass.count() > 0);
    assert.ok(have, 'Login page not visible');
});
