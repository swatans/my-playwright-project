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
    // some social links may redirect (twitter -> x.com). accept both.
    const allowedMap = {
        twitter: ['twitter.com', 'x.com'],
        facebook: ['facebook.com'],
        linkedin: ['linkedin.com']
    };

    // host param may be 'twitter.com' or 'twitter'
    const wanted = host.toLowerCase();
    const accepted = allowedMap[wanted] || [host];

    // we stored popup/page in world as this._popup (or similar). If your step saves differently adapt:
    // If your click step returns { popup, url } use that. Here try multiple ways:
    let popup = this._footerPopup || this._aboutPopup || this._popup || null;
    if (!popup) {
        // try to read context pages and pick last opened page
        const pages = this.page.context().pages();
        popup = pages.length > 1 ? pages[pages.length - 1] : null;
    }

    assert.ok(popup, 'No popup/tab detected');

    const url = (typeof popup === 'object' && popup.url) ? (await popup.url()).toString() : String(popup);
    const ok = accepted.some(domain => url.includes(domain));
    assert.ok(ok, `Expected host ${accepted.join('|')} in url "${url}"`);
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
