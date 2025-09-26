// tests/support/hooks.js
const { Before, After, BeforeAll, setDefaultTimeout } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');

setDefaultTimeout(60 * 1000); // extend default timeout ke 60s (sesuaikan)

BeforeAll(() => {
    if (!fs.existsSync('reports')) fs.mkdirSync('reports', { recursive: true });
});

Before(async function (scenario) {
    // robust name extraction
    const name = (scenario && (scenario.pickle?.name || scenario.gherkinDocument?.feature?.name)) || 'scenario';
    this.testName = String(name).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    this.tracingStarted = false;

    // Determine headless: if HEADLESS env is set, use its boolean value (true/false).
    // If not set, default to headed (false).
    const headlessEnv = process.env.HEADLESS;
    const headless = (typeof headlessEnv === 'string') ? (headlessEnv.toLowerCase() === 'true') : false;

    console.log(`Launching browser — headless=${headless}`); // helpful for debugging runs
    await this.launchBrowser({ headless, args: [] });

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
    const status = scenario?.result?.status || (scenario?.result?.status?.toString && scenario.result.status.toString()) || '';
    const failed = String(status).toLowerCase() === 'failed';

    if (failed) {
        // screenshot
        try {
            const shotPath = path.join(base, `${this.testName}-${ts}.png`);
            await this.page.screenshot({ path: shotPath, fullPage: true });
            console.log('Saved screenshot:', shotPath);
        } catch (e) { console.warn('Screenshot failed', e); }
    }

    // trace stop only if tracing actually started
    if (this.context && this.tracingStarted) {
        try {
            const tracePath = path.join(base, `${this.testName}-${ts}-trace.zip`);
            await this.context.tracing.stop({ path: tracePath });
            console.log('Saved trace:', tracePath);
        } catch (e) {
            console.warn('Trace failed', e);
        }
    } else {
        // if tracing wasn't started, ensure we don't try to stop or ignore
        if (this.context && (process.env.TRACE === 'true' || process.env.RECORD === 'true')) {
            // optional: if env requested trace but didn't start, log it
            console.log('Tracing not started; no trace to stop.');
        }
    }

    // always close browser per-scenario for isolation
    await this.closeBrowser();
});
