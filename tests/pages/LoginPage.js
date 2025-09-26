// tests/pages/LoginPage.js
class LoginPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;
        this.selectors = {
            username: '[data-test="username"]',
            password: '[data-test="password"]',
            loginBtn: '[data-test="login-button"]',
            errorContainer: '.error-message-container',
            credentialsBox: '[data-test="login-credentials"]',
            passwordHint: '[data-test="login-password"]'
        };
        this.url = process.env.BASE_URL || 'https://www.saucedemo.com/';
    }

    async goto() {
        await this.page.goto(this.url);
    }

    async login(username, password) {
        if (username !== undefined) await this.page.fill(this.selectors.username, username);
        if (password !== undefined) await this.page.fill(this.selectors.password, password);
        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            this.page.click(this.selectors.loginBtn)
        ]);
    }

    async getErrorText() {
        return this.page.locator(this.selectors.errorContainer).innerText().catch(() => '');
    }

    async isOnInventory() {
        // either check URL or "Products" heading
        return (await this.page.url()).includes('/inventory.html')
            || await this.page.locator('text=Products').count() > 0;
    }
}
module.exports = LoginPage;
