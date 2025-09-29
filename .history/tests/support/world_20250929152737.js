// tests/support/world.js
const { setWorldConstructor } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');
const playwright = require('playwright');

class CustomWorld {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        // default storage state (bisa override via env STORAGE_STATE)
        this.storageStatePath = process.env.STORAGE_STATE || path.resolve(process.cwd(), './state/auth.json');
        this.testName = null;
        this.tracingStarted = false;
    }

    /**
     * Launch browser and create context + page.
     * @param {Object} options
     * @param {boolean} options.headless - headless mode (default true in CI)
     * @param {Array} options.args - passthrough chromium args
     * @param {string} options.product - 'chromium'|'firefox'|'webkit', default from env BROWSER or 'chromium'
     */
    async launchBrowser({ headless = (process.env.CI ? true : false), args = [], product } = {}) {
        // determine product: prefer arg -> env -> fallback chromium
        const browserEnv = (process.env.BROWSER || '').toLowerCase();
        const valid = ['chromium', 'firefox', 'webkit'];
        const browserProduct = product || (valid.includes(browserEnv) ? browserEnv : 'chromium');

        const launchOptions = { headless, args };

        try {
            // launch correct product
            this.browser = await playwright[browserProduct].launch(launchOptions);

            // if storage state exists, load it
            const storageOpts = {};
            if (this.storageStatePath && fs.existsSync(this.storageStatePath)) {
                storageOpts.storageState = this.storageStatePath;
                // log small info for debugging
                // console.log(`Loading storage state from ${this.storageStatePath}`);
            }

            this.context = await this.browser.newContext(storageOpts);
            this.page = await this.context.newPage();

            // attach product name for debugging if needed
            this.browserProduct = browserProduct;

            return { browser: this.browser, context: this.context, page: this.page };
        } catch (err) {
            // ensure partial resources closed
            try { if (this.browser) await this.browser.close(); } catch (e) { /* ignore */ }
            this.browser = null;
            this.context = null;
            this.page = null;
            throw err;
        }
    }

    /**
     * Close context and browser safely.
     */
    async closeBrowser() {
        try {
            if (this.context) {
                // stop tracing if active before closing context
                try {
                    if (this.tracingStarted && this.context.tracing) {
                        // don't throw if tracing stop fails
                        await this.context.tracing.stop().catch(() => { });
                        this.tracingStarted = false;
                    }
                } catch (e) {
                    // ignore
                }

                await this.context.close();
                this.context = null;
            }
        } catch (e) {
            console.warn('Error closing context:', e);
        }

        try {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
        } catch (e) {
            console.warn('Error closing browser:', e);
            this.browser = null;
        }

        this.page = null;
    }

    /**
     * Save storage state to disk (ensuring directory exists)
     * @param {string} targetPath
     */
    async saveStorageState(targetPath = this.storageStatePath) {
        if (!this.context) {
            throw new Error('No browser context to save state from.');
        }
        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        await this.context.storageState({ path: targetPath });
    }

    /**
     * Optional helpers for tracing.
     */
    async startTracing(options = { screenshots: true, snapshots: true }) {
        if (this.context && this.context.tracing && !this.tracingStarted) {
            await this.context.tracing.start(options);
            this.tracingStarted = true;
        }
    }

    async stopTracing(savePath) {
        if (this.context && this.context.tracing && this.tracingStarted) {
            if (savePath) {
                await this.context.tracing.stop({ path: savePath });
            } else {
                await this.context.tracing.stop();
            }
            this.tracingStarted = false;
        }
    }
}

setWorldConstructor(CustomWorld);

module.exports = CustomWorld;
