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
        await this.page.click(this.selectors.burgerButton);
        await this.page.waitForSelector(this.selectors.inventoryLink, { state: 'visible', timeout: 3000 });
    }

    async clickAboutAndWaitForPopup({ popupTimeout = 3000 } = {}) {
        // Try to catch new page creation
        const ctx = this.page.context();
        const pagesBefore = ctx.pages().slice(); // array of Page
        // trigger click
        await this.page.click(this.selectors.aboutLink).catch(() => { });
        // wait briefly for new page
        const start = Date.now();
        while (Date.now() - start < popupTimeout) {
            const pagesAfter = ctx.pages();
            if (pagesAfter.length > pagesBefore.length) {
                // find the new one
                const newPage = pagesAfter.find(p => !pagesBefore.includes(p));
                if (newPage) {
                    await newPage.waitForLoadState('load').catch(() => null);
                    return { popup: newPage, openedInSamePage: false, url: newPage.url() };
                }
            }
            // small sleep
            // eslint-disable-next-line no-await-in-loop
            await new Promise(res => setTimeout(res, 150));
        }
        // fallback: maybe opened in same tab - check current url
        const curUrl = this.page.url();
        return { popup: null, openedInSamePage: true, url: curUrl };
    }

    async clickLogout() {
        await this.page.click(this.selectors.logoutLink);
    }

    async clickResetAppState() {
        await this.page.click(this.selectors.resetLink);
    }
}

module.exports = SidebarPage;
