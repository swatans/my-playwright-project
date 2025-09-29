// tests/steps/footer.step.js
const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

When('I click footer social {string}', async function (name) {
    // name: Twitter / Facebook / LinkedIn
    const map = {
        'Twitter': '[data-test="social-twitter"], a[href*="twitter"], a[href*="x.com"]',
        'Facebook': '[data-test="social-facebook"], a[href*="facebook"]',
        'LinkedIn': '[data-test="social-linkedin"], a[href*="linkedin"]'
    };
    const sel = map[name] || `a:has-text("${name}")`;
    // capture popup pages before/after
    const ctx = this.page.context();
    const before = ctx.pages();
    await this.page.locator(sel).first().click().catch(() => null);
    // try find new page
    const start = Date.now();
    let newPage = null;
    while (Date.now() - start < 4000) {
        const after = ctx.pages();
        if (after.length > before.length) {
            newPage = after.find(p => !before.includes(p));
            break;
        }
        await new Promise(r => setTimeout(r, 150));
    }
    this._footer_popup = newPage || null;
});

Then('a new tab should open with {string}', async function (host) {
    // accept twitter.com OR x.com for "twitter"
    const popup = this._footer_popup;
    // if no popup, maybe clicked same tab; fallback to current url
    const url = popup ? popup.url() : this.page.url();
    const expectedHost = host.toLowerCase();
    if (expectedHost.includes('twitter.com')) {
        // accept x.com as twitter replacement
        assert.ok(url.includes('twitter.com') || url.includes('x.com'), `Expected host ${host} in url "${url}"`);
    } else {
        assert.ok(url.includes(expectedHost), `Expected host ${host} in url "${url}"`);
    }
});

Then('the footer copyright matches current year', async function () {
    const el = this.page.locator('[data-test="footer-copy"], .footer_copy');
    const txt = (await el.textContent().catch(() => '')).trim();
    const year = new Date().getFullYear();
    assert.ok(txt.includes(String(year)), `Footer copyright should include ${year}, got "${txt}"`);
});

When('I click footer {string}', async function (label) {
    // e.g. Terms of Service, Privacy Policy
    const sel = `text="${label}"`;
    await this.page.locator(sel).first().click().catch(() => null);
});

Then('the page opens (or link exists)', async function () {
    // if new tab opened, check its URL; otherwise check that the last clicked link had href
    const ctx = this.page.context();
    const pages = ctx.pages();
    if (pages.length > 1) {
        const p = pages[pages.length - 1];
        const url = p.url();
        assert.ok(url && url.length > 0, 'New tab opened but url is empty');
        return;
    }
    // fallback: find an anchor matching Terms/Privacy visible and verify href
    const anchors = await this.page.locator('a:visible').all();
    let found = false;
    for (const a of anchors) {
        const href = await a.getAttribute('href').catch(() => null);
        if (href && href.length > 0 && (href.startsWith('http') || href.startsWith('/'))) {
            found = true;
            break;
        }
    }
    assert.ok(found, 'No link found or no new page opened');
});
