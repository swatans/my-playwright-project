// tests/pages/SidebarPage.js
class SidebarPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;
        this.openMenuBtn = '#react-burger-menu-btn, [data-test="open-menu"]';
        this.closeMenuBtn = '#react-burger-cross-btn, [data-test="close-menu"]';
        this.menuWrap = '.bm-menu-wrap, .bm-menu'; // visible container
        this.allItems = '[data-test="inventory-sidebar-link"], #inventory_sidebar_link';
        this.about = '[data-test="about-sidebar-link"], #about_sidebar_link';
        this.logout = '[data-test="logout-sidebar-link"], #logout_sidebar_link';
        this.resetApp = '[data-test="reset-sidebar-link"], #reset_sidebar_link';
    }

    async open() {
        await this.page.click(this.openMenuBtn);
        // wait for menu wrapper to show up
        await this.page.waitForSelector(this.menuWrap, { state: 'visible', timeout: 3000 });
    }

    async close() {
        // prefer close button if present
        const closeCount = await this.page.locator(this.closeMenuBtn).count();
        if (closeCount > 0) {
            await this.page.click(this.closeMenuBtn);
            await this.page.waitForSelector(this.menuWrap, { state: 'hidden', timeout: 3000 }).catch(() => { });
        } else {
            // fallback: click outside
            await this.page.click('body', { position: { x: 10, y: 10 } });
            await this.page.waitForSelector(this.menuWrap, { state: 'hidden', timeout: 3000 }).catch(() => { });
        }
    }

    async isVisible() {
        const c = await this.page.locator(this.menuWrap).count();
        if (c === 0) return false;
        return await this.page.locator(this.menuWrap).first().isVisible();
    }

    async clickAllItems() {
        await this.page.click(this.allItems);
    }

    async clickAboutAndWaitForPopup() {
        // clicking About opens external site in a new tab (popup). Use waitForEvent('popup')
        const [popup] = await Promise.all([
            this.page.waitForEvent('popup', { timeout: 5000 }),
            this.page.click(this.about)
        ]).catch(async () => {
            // sometimes About opens in same tab (target=_self) - attempt to click then return current page
            await this.page.click(this.about);
            return [null];
        });
        return popup; // may be undefined/null
    }

    async clickLogout() {
        await this.page.click(this.logout);
    }

    async clickResetAppState() {
        await this.page.click(this.resetApp);
    }
}

module.exports = SidebarPage;
