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

// tests/steps/sidebar.step.js (replace the About step)
When('I click the "About" menu entry', async function () {
    if (!this.sidebar) this.sidebar = new (require('../pages/SidebarPage'))(this.page);
    const res = await this.sidebar.clickAboutAndWaitForPopup({ popupTimeout: 3000 });
    this._aboutPopupInfo = res; // store for assertion
});

Then('a new tab should open to {string}', async function (host) {
    const info = this._aboutPopupInfo || {};
    if (info.popup) {
        const url = info.url;
        if (!url.includes(host)) {
            throw new Error(`About popup url does not include ${host}: ${url}`);
        }
        // close popup to keep environment clean
        await info.popup.close().catch(() => null);
    } else if (info.openedInSamePage) {
        const url = info.url;
        if (!url.includes(host)) {
            // if it didn't navigate to external, still consider failure
            throw new Error(`About opened in same page but url does not include ${host}: ${url}`);
        }
        // navigate back
        await this.page.goBack().catch(() => null);
    } else {
        throw new Error('About link did not open a new tab nor navigate to the expected host');
    }
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
