// tests/steps/sidebar.step.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const SidebarPage = require('../pages/SidebarPage');
const InventoryPage = require('../pages/InventoryPage');

When('I open the sidebar menu', async function () {
    this.sidebar = this.sidebar || new SidebarPage(this.page);
    await this.sidebar.open();
});

Then('the sidebar should be visible', async function () {
    const ok = await this.sidebar.isVisible();
    assert.ok(ok, 'Sidebar expected to be visible');
});

When('I close the sidebar menu', async function () {
    await this.sidebar.close();
});

Then('the sidebar should be hidden', async function () {
    const ok = await this.sidebar.isVisible();
    assert.ok(!ok, 'Sidebar expected to be hidden');
});

When('I click the "All Items" menu entry', async function () {
    this.sidebar = this.sidebar || new SidebarPage(this.page);
    await this.sidebar.clickAllItems();
    // wait for inventory page visible
    await this.page.waitForURL('**/inventory.html', { timeout: 3000 }).catch(() => { });
});

When('I click the "About" menu entry', async function () {
    this.sidebar = this.sidebar || new SidebarPage(this.page);
    // store popup (if open) on world for assertion
    const popup = await this.sidebar.clickAboutAndWaitForPopup();
    this._aboutPopup = popup || null;
});

Then('a new tab should open to {string}', async function (host) {
    const url = this.aboutPopup.url();
    assert.ok(url.includes(host), `Expected ${host} in ${url}`);
});

When('I click the "Reset App State" menu entry', async function () {
    this.sidebar = this.sidebar || new SidebarPage(this.page);
    // click reset
    await this.sidebar.clickResetAppState();
    // short wait for UI update
    await this.page.waitForTimeout(300);
});

When('I click the "Logout" menu entry', async function () {
    this.sidebar = this.sidebar || new SidebarPage(this.page);
    await this.sidebar.clickLogout();
    // wait for login page
    await this.page.waitForURL('**/index.html', { timeout: 5000 }).catch(() => { });
});

Then('I should see the login page', async function () {
    // detect login form present
    const uname = this.page.locator('[data-test="username"], #user-name');
    const pass = this.page.locator('[data-test="password"], #password');
    assert.ok(await uname.count() > 0 && await pass.count() > 0, 'Login page not visible');
});
