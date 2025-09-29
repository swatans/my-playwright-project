// tests/pages/CheckoutPage.js
class CheckoutPage {
    constructor(page) {
        this.page = page;
        this.container = page.locator('[data-test="checkout-info-container"], #checkout_info_container');
        this.firstName = page.locator('[data-test="firstName"], #first-name');
        this.lastName = page.locator('[data-test="lastName"], #last-name');
        this.postalCode = page.locator('[data-test="postalCode"], #postal-code');
        this.errorContainer = page.locator('[data-test="checkout-info-container"] .error-message-container, .error-message-container');
        this.continueBtn = page.locator('[data-test="continue"], #continue, input[name="continue"], input#continue');
        this.cancelBtn = page.locator('[data-test="cancel"], #cancel, button#cancel');
        this.headerTitle = page.locator('[data-test="title"]'); // "Checkout: Your Information"
    }

    async waitForVisible(timeout = 7000) {
        await this.container.waitFor({ state: 'visible', timeout });
    }

    async isVisible() {
        return await this.container.isVisible();
    }

    async fillForm({ firstName = '', lastName = '', postalCode = '' } = {}) {
        await this.firstName.waitFor({ state: 'visible' });
        await this.firstName.fill(firstName);
        await this.lastName.fill(lastName);
        await this.postalCode.fill(postalCode);
    }

    async clickContinue() {
        // click and let app navigate or render next step
        await this.continueBtn.waitFor({ state: 'visible' });
        await Promise.all([
            // if app does full navigation this will catch it; if not, it will timeout silently
            this.page.waitForNavigation({ waitUntil: 'load', timeout: 5000 }).catch(() => { }),
            this.continueBtn.click()
        ]);
    }

    async clickCancel() {
        await this.cancelBtn.click();
    }

    async getErrorText() {
        const visible = await this.errorContainer.isVisible().catch(() => false);
        if (!visible) return '';
        return (await this.errorContainer.innerText()).trim();
    }
}

module.exports = CheckoutPage;
