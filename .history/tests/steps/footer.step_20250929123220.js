const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

When('I click footer social {string}', async function (network) {
    const map = {
        'Twitter': '[data-test="social-twitter"], a[href*="twitter.com"]',
        'Facebook': '[data-test="social-facebook"], a[href*="facebook.com"]',
        'LinkedIn': '[data-test="social-linkedin"], a[href*="linkedin.com"]'
    };
    const sel = map[network] || `a:has-text("${network}")`;
    const ctx = this.page.context();
    const before = ctx.pages().slice();
    await this.page.locator(sel).first().click().catch(() => null);

    // wait short time for popup
    let popup = null;
    const start = Date.now();
    while (Date.now() - start < 4000) {
        const after = ctx.pages();
        if (after.length > before.length) {
            popup = after.find(p => !before.includes(p));
            break;
        }
        await new Promise(r => setTimeout(r, 150));
    }
    this._footerPopup = popup || null;
});

Then('a new tab should open with {string}', async function (host) {
    const popup = this._footerPopup;
    assert.ok(popup, 'No popup opened');
    await popup.waitForLoadState('load').catch(() => null);
    const url = popup.url();
    assert.ok(url.includes(host), `Expected host "${host}" in url "${url}"`);
});

Then('the footer should be visible', async function () {
    const el = this.page.locator('footer, .footer, [data-test="footer"]');
    assert.ok(await el.count() > 0 && await el.first().isVisible().catch(() => false), 'Footer not visible');
});

Then('the footer copyright matches current year', async function () {
    const el = this.page.locator('.footer_copy, [data-test="footer-copy"], footer .footer_copy');
    const txt = (await el.first().textContent().catch(() => '')).trim();
    const year = new Date().getFullYear().toString();
    assert.ok(txt.includes(year), `Footer copyright does not include ${year}. Got: "${txt}"`);
});

When('I click footer {string}', async function (linkText) {
    // click Terms of Service / Privacy Policy or the link if exists
    const sel = `text="${linkText}"`;
    await this.page.locator(sel).first().click().catch(() => null);
    // no assertion here, caller will validate navigation or link presence
});
