const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const LoginPage = require('../pages/LoginPage');

Given('I open the Saucedemo login page', async function () {
    this.loginPage = new LoginPage(this.page);
    await this.loginPage.goto();
});

When('I login with username {string} and password {string}', async function (username, password) {
    // treat empty string as empty input; null/undefined means skip setting
    const u = username === '' ? '' : username;
    const p = password === '' ? '' : password;
    await this.loginPage.login(u, p);
});

Then('I should see error message {string}', async function (expected) {
    const text = await this.loginPage.getErrorText();
    assert.ok(text.includes(expected), `Expected error "${expected}", got "${text}"`);
});

Then('I should be on the inventory page', async function () {
    const ok = await this.loginPage.isOnInventory();
    assert.ok(ok, 'Not on inventory page');
});
