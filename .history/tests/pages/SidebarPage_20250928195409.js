// tests/pages/SidebarPage.js
class SidebarPage {
    constructor(page) {
        this.page = page;
        this.selectors = {
            burgerButton: '#react-burger-menu-btn, .bm-burger-button button',
            inventoryLink: '[data-test="inventory-sidebar-link"], #inventory_sidebar_link',
            aboutLink: '[data-test="about-sidebar-link"], #about_sidebar_link',
            logoutLink: '[data-test="logout-sidebar-link"], #logout_sidebar_link',
            resetLink: '[data-test="reset-sidebar-link"], #reset_sidebar_link'
        };
    }

    async open() {
        await this.page.click(this.selectors.burgerButton).catch(() => null);
        await this.page.waitForSelector(this.selectors.inventoryLink, { state: 'visible', timeout: 3000 }).catch(() => null);
    }

    async clickAboutAndWaitForPopup({ popupTimeout = 5000 } = {}) {
        const ctx = this.page.context();
        const pagesBefore = ctx.pages().slice();
        // try to click the about link
        await this.page.click(this.selectors.aboutLink).catch(() => null);

        const start = Date.now();
        // poll for new page
        while (Date.now() - start < popupTimeout) {
            const pagesAfter = ctx.pages();
            if (pagesAfter.length > pagesBefore.length) {
                const newPage = pagesAfter.find(p => !pagesBefore.includes(p));
                if (newPage) {
                    await newPage.waitForLoadState('load').catch(() => null);
                    return { popup: newPage, openedInSamePage: false, url: newPage.url() };
                }
            }
            await new Promise(res => setTimeout(res, 150));
        }

        // fallback: maybe navigated same page
        return { popup: null, openedInSamePage: true, url: this.page.url() };
    }

    async clickLogout() {
        await this.page.click(this.selectors.logoutLink).catch(() => null);
    }

    async clickResetAppState() {
        await this.page.click(this.selectors.resetLink).catch(() => null);
    }
}

module.exports = SidebarPage;
