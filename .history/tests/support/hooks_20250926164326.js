// tests/support/hooks.js
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');

BeforeAll(() => {
    if (!fs.existsSync('reports')) fs.mkdirSync('reports', { recursive: true });
});

Before(async function (scenario) {
    // nama test bisa berguna untuk file artefak
    this.testName = scenario.pickle.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    // launch browser with HEADLESS env control
    await this.launchBrowser({ headless: process.env.HEADLESS !== 'false' });

    // start tracing (Playwright tracing)
    if (this.context && (process.env.TRACE === 'true' || process.env.RECORD === 'true')) {
        await this.context.tracing.start({ screenshots: true, snapshots: true });
    }

    // optionally start video per page (video settings depend on context options)
});

After(async function (scenario) {
    const ts = Date.now();
    const base = 'reports';
    // if failed, save artifacts
    if (scenario.result?.status === 'FAILED') {
        // screenshot
        try {
            const shotPath = path.join(base, `${this.testName}-${ts}.png`);
            await this.page.screenshot({ path: shotPath, fullPage: true });
            console.log('Saved screenshot:', shotPath);
        } catch (e) { console.warn('Screenshot failed', e); }

        // trace
        try {
            if (this.context) {
                const tracePath = path.join(base, `${this.testName}-${ts}-trace.zip`);
                await this.context.tracing.stop({ path: tracePath });
                console.log('Saved trace:', tracePath);
            }
        } catch (e) { console.warn('Trace failed', e); }
    } else {
        // stop tracing but don't save unless requested
        if (this.context) {
            try { await this.context.tracing.stop(); } catch (e) { }
        }
    }

    // always close browser per-scenario for isolation
    await this.closeBrowser();
});
