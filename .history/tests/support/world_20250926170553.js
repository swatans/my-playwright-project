// tests/support/world.js
const { setWorldConstructor } = require('@cucumber/cucumber');
const playwright = require('playwright');

class CustomWorld {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.storageStatePath = process.env.STORAGE_STATE || './state/auth.json';
        this.testName = null;
    }

    async launchBrowser({ headless = false, args = [] } = {}) {
        this.browser = await playwright.chromium.launch({ headless, args });
        this.context = await this.browser.newContext({
            storageState: undefined // optionally load storage state
        });
        this.page = await this.context.newPage();
    }

    async closeBrowser() {
        if (this.context) await this.context.close();
        if (this.browser) await this.browser.close();
    }

    async saveStorageState(path = this.storageStatePath) {
        if (this.context) await this.context.storageState({ path });
    }
}

setWorldConstructor(CustomWorld);
