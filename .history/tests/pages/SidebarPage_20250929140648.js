class SidebarPage {
    constructor(page) {
        this.page = page;
        this.sel = {
            burger: '#react-burger-menu-btn, .bm-burger-button button',
            menuWrap: '.bm-menu-wrap, .bm-menu',
            allItems: '[data-test="inventory-sidebar-link"], #inventory_sidebar_link',
            about: '[data-test="about-sidebar-link"], #about_sidebar_link',
            reset: '[data-test="reset-sidebar-link"], #reset_sidebar_link',
            logout: '[data-test="logout-sidebar-link"], #logout_sidebar_link',
            closeBtn: '#react-burger-cross-btn, .bm-cross-button button'
        };
    }

    async open() {
        await this.page.locator(this.sel.burger).first().click().catch(() => null);
        // wait for potential menu wrap visible OR attribute aria-hidden removed
        const wrap = this.page.locator(this.sel.menuWrap).first();
        await wrap.waitFor({ state: 'visible', timeout: 2000 }).catch(() => null);
    }

    async close() {
        // click the close button if exists, else click burger to toggle
        const closeBtn = this.page.locator(this.sel.closeBtn).first();
        if (await closeBtn.count() > 0) {
            await closeBtn.click().catch(() => null);
        } else {
            await this.page.locator(this.sel.burger).first().click().catch(() => null);
        }
        // wait until menu is hidden
        const wrap = this.page.locator(this.sel.menuWrap).first();
        await wrap.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => null);
    }

    async isVisible() {
        const wrap = this.page.locator(this.sel.menuWrap).first();
        // some implementations keep element in DOM but set aria-hidden="true" or style transform
        if (await wrap.count() === 0) return false;
        const hidden = await wrap.getAttribute('aria-hidden').catch(() => null);
        if (hidden === 'true') return false;
        // also check computed style via isVisible fallback
        return await wrap.isVisible().catch(() => false);
    }

    async clickAllItems() {
        await this.page.locator(this.sel.allItems).first().click().catch(() => null);
    }

    async clickAboutAndWaitForPopup({ popupTimeout = 5000 } = {}) {
        const ctx = this.page.context();
        const before = ctx.pages().slice();
        await this.page.locator(this.sel.about).first().click().catch(() => null);

        const start = Date.now();
        while (Date.now() - start < popupTimeout) {
            const after = ctx.pages();
            if (after.length > before.length) {
                const newPage = after.find(p => !before.includes(p));
                if (newPage) {
                    await newPage.waitForLoadState('load').catch(() => null);
                    return newPage; // return Playwright Page object
                }
            }
            await new Promise(r => setTimeout(r, 150));
        }
        return null;
    }

    async clickReset() {
        await this.page.locator(this.sel.reset).first().click().catch(() => null);
    }
}

module.exports = SidebarPage;
