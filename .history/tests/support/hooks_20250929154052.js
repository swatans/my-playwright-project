// tests/support/hooks.js
const { Before, After, BeforeAll, setDefaultTimeout } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');

setDefaultTimeout(60 * 1000); // 60s, sesuaikan

BeforeAll(() => {
    if (!fs.existsSync('reports')) fs.mkdirSync('reports', { recursive: true });
    if (!fs.existsSync('reports/json')) fs.mkdirSync('reports/json', { recursive: true });
    if (!fs.existsSync('reports/html')) fs.mkdirSync('reports/html', { recursive: true });
});

Before(async function (scenario) {
    // robust name extraction
    const name = (scenario && (scenario.pickle?.name || scenario.gherkinDocument?.feature?.name)) || 'scenario';
    this.testName = String(name).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    this.tracingStarted = false;

    // Determine headless from env (default true in CI)
    const headlessEnv = process.env.HEADLESS;
    const headless = (typeof headlessEnv === 'string') ? (headlessEnv.toLowerCase() === 'true') : true;

    const browserEnv = (process.env.BROWSER || 'chromium').toLowerCase();
    const valid = ['chromium', 'firefox', 'webkit'];
    const browserName = valid.includes(browserEnv) ? browserEnv : 'chromium';

    console.log(`Launching browser — product=${browserName} headless=${headless}`);

    // Use World.launchBrowser (this === CustomWorld instance)
    await this.launchBrowser({ product: browserName, headless });

    // start tracing if requested
    if (this.context && (process.env.TRACE === 'true' || process.env.RECORD === 'true')) {
        try {
            await this.context.tracing.start({ screenshots: true, snapshots: true });
            this.tracingStarted = true;
        } catch (e) {
            console.warn('Tracing start failed:', e);
            this.tracingStarted = false;
        }
    }
});

After(async function (scenario) {
    const ts = Date.now();
    const base = 'reports';
    const status = scenario?.result?.status || '';
    const failed = String(status).toLowerCase() === 'failed';

    if (failed && this.page) {
        try {
            const shotPath = path.join(base, `${this.testName}-${ts}.png`);
            await this.page.screenshot({ path: shotPath, fullPage: true });
            console.log('Saved screenshot:', shotPath);
        } catch (e) { console.warn('Screenshot failed', e); }
    }

    if (this.context && this.tracingStarted) {
        try {
            const tracePath = path.join(base, `${this.testName}-${ts}-trace.zip`);
            await this.context.tracing.stop({ path: tracePath });
            console.log('Saved trace:', tracePath);
        } catch (e) {
            console.warn('Trace failed', e);
        }
    } else {
        if (this.context && (process.env.TRACE === 'true' || process.env.RECORD === 'true')) {
            console.log('Tracing not started; no trace to stop.');
        }
    }

    // close browser via World.closeBrowser (safer)
    try {
        await this.closeBrowser();
    } catch (e) {
        console.warn('Error closing browser', e);
    }
});
