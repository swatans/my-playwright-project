class FooterPage {
    constructor(page) {
        this.page = page;
        this.sel = {
            twitter: '[data-test="social-twitter"], a[href*="twitter.com"]',
            fb: '[data-test="social-facebook"], a[href*="facebook.com"]',
            linkedin: '[data-test="social-linkedin"], a[href*="linkedin.com"]',
            copyright: '.footer_copy, [data-test="footer-copy"]',
            terms: 'text=Terms of Service',
            privacy: 'text=Privacy Policy',
            footer: 'footer, .footer'
        };
    }

    async clickSocial(network) {
        const map = { twitter: this.sel.twitter, facebook: this.sel.fb, linkedin: this.sel.linkedin };
        const sel = map[network.toLowerCase()] || this.sel.footer;
        const ctx = this.page.context();
        const before = ctx.pages().slice();
        await this.page.locator(sel).first().click().catch(() => null);

        // wait for popup
        const start = Date.now();
        while (Date.now() - start < 4000) {
            const after = ctx.pages();
            if (after.length > before.length) {
                const newPage = after.find(p => !before.includes(p));
                if (newPage) {
                    await newPage.waitForLoadState('load').catch(() => null);
                    return newPage;
                }
            }
            await new Promise(r => setTimeout(r, 150));
        }
        return null;
    }

    async footerVisible() {
        const el = this.page.locator(this.sel.footer);
        return (await el.count() > 0) && (await el.first().isVisible().catch(() => false));
    }

    async copyrightText() {
        return (await this.page.locator(this.sel.copyright).first().textContent().catch(() => '')).trim();
    }
}

module.exports = FooterPage;
