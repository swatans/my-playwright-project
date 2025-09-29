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
        await this.page.locator(this.sel.menuWrap).first().waitFor({ state: 'visible', timeout: 2000 }).catch(() => null);
    }

    async isVisible() {
        return this.page.locator(this.sel.menuWrap).first().isVisible().catch(() => false);
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
                    return { popup: newPage, url: newPage.url() };
                }
            }
            await new Promise(r => setTimeout(r, 150));
        }
        return { popup: null, url: this.page.url() };
    }

    async clickReset() {
        await this.page.locator(this.sel.reset).first().click().catch(() => null);
    }
}

module.exports = SidebarPage;
