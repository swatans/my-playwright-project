// tests/support/hooks.js
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');

BeforeAll(() => {
    if (!fs.existsSync('reports')) fs.mkdirSync('reports', { recursive: true });
});
// Before(async function (scenario) { ... })
Before(async function (scenario) {
    // try multiple places for name
    const name = (scenario && (scenario.pickle?.name || scenario.gherkinDocument?.feature?.name)) || 'scenario';
    this.testName = String(name).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    await this.launchBrowser({ headless: process.env.HEADLESS !== 'false' });
    if (this.context && (process.env.TRACE === 'true' || process.env.RECORD === 'true')) {
        await this.context.tracing.start({ screenshots: true, snapshots: true });
    }
});


After(async function (scenario) {
    const ts = Date.now();
    const base = 'reports';
    // get status string robustly
    const status = scenario?.result?.status || (scenario?.result?.status?.toString && scenario.result.status.toString()) || null;
    const failed = status && String(status).toLowerCase() === 'failed';

    if (failed) {
        try {
            const shotPath = path.join(base, `${this.testName}-${ts}.png`);
            await this.page.screenshot({ path: shotPath, fullPage: true });
            console.log('Saved screenshot:', shotPath);
        } catch (e) { console.warn('Screenshot failed', e); }

        try {
            if (this.context) {
                const tracePath = path.join(base, `${this.testName}-${ts}-trace.zip`);
                await this.context.tracing.stop({ path: tracePath });
                console.log('Saved trace:', tracePath);
            }
        } catch (e) { console.warn('Trace failed', e); }
    } else {
        if (this.context) {
            try { await this.context.tracing.stop(); } catch (e) { /* ignore */ }
        }
    }

    await this.closeBrowser();
});
