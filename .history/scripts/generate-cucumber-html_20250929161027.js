// scripts/generate-cucumber-html.js
const fs = require('fs');
const path = require('path');
const { generate } = require('multiple-cucumber-html-reporter');

const srcJsonRoot = path.resolve(process.cwd(), 'reports', 'json');      // where artifacts were downloaded
const mergedJsonDir = path.resolve(process.cwd(), 'reports', 'json-merged'); // temp dir for reporter
const outDir = path.resolve(process.cwd(), 'reports', 'html');

function collectJsonFilesRecursive(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            files.push(...collectJsonFilesRecursive(full));
        } else if (e.isFile() && full.toLowerCase().endsWith('.json')) {
            files.push(full);
        }
    }
    return files;
}

function detectBrowserFromPath(filepath) {
    const lower = filepath.toLowerCase();
    if (lower.includes('chromium')) return 'chromium';
    if (lower.includes('firefox')) return 'firefox';
    if (lower.includes('webkit')) return 'webkit';
    // fallback: if filename contains browser token like result-chromium-.. or report-json-chromium
    const basename = path.basename(lower);
    if (basename.includes('chromium')) return 'chromium';
    if (basename.includes('firefox')) return 'firefox';
    if (basename.includes('webkit')) return 'webkit';
    return 'auto';
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// prepare
ensureDir(mergedJsonDir);
ensureDir(outDir);

const jsonFiles = collectJsonFilesRecursive(srcJsonRoot);

if (jsonFiles.length === 0) {
    console.error('No JSON reports found in', srcJsonRoot);
    // for debug: list tree if exists
    if (fs.existsSync(srcJsonRoot)) {
        console.error('Directory tree for', srcJsonRoot, ':');
        (function printTree(dir, prefix = '') {
            const list = fs.readdirSync(dir, { withFileTypes: true });
            for (const it of list) {
                const p = path.join(dir, it.name);
                console.error(prefix + it.name + (it.isDirectory() ? '/' : ''));
                if (it.isDirectory()) printTree(p, prefix + '  ');
            }
        })(srcJsonRoot, '  ');
    }
    process.exit(1);
}

console.log('Found JSON files:', jsonFiles);

// We will read each json file and ensure each feature has metadata with platform/browser/device
// Then we write each processed JSON to mergedJsonDir with unique prefixed names.
jsonFiles.forEach((jf, idx) => {
    try {
        const raw = fs.readFileSync(jf, 'utf8');
        let content = null;
        try {
            content = JSON.parse(raw);
        } catch (parseErr) {
            console.warn('Skipping invalid JSON file:', jf, parseErr && parseErr.message);
            return;
        }

        const browserName = detectBrowserFromPath(jf);
        const defaultMetadata = {
            browser: { name: browserName, version: process.env.BROWSER_VERSION || '' },
            device: process.env.DEVICE || 'CI',
            platform: { name: process.env.OS || process.platform || 'linux', version: process.version || '' }
        };

        // Ensure array of features
        if (Array.isArray(content)) {
            content.forEach(feature => {
                // feature may be null/undefined if cucumber produced something odd; guard
                if (!feature || typeof feature !== 'object') return;

                // ensure feature.metadata exists and has platform/browser/device
                feature.metadata = feature.metadata || {};

                // metadata.browser may be object or string; normalize to object { name, version }
                if (!feature.metadata.browser) {
                    feature.metadata.browser = { name: browserName, version: '' };
                } else if (typeof feature.metadata.browser === 'string') {
                    feature.metadata.browser = { name: feature.metadata.browser, version: '' };
                } else {
                    feature.metadata.browser.name = feature.metadata.browser.name || browserName;
                    feature.metadata.browser.version = feature.metadata.browser.version || '';
                }

                // platform
                feature.metadata.platform = feature.metadata.platform || {};
                if (typeof feature.metadata.platform === 'string') {
                    feature.metadata.platform = { name: feature.metadata.platform, version: '' };
                } else {
                    feature.metadata.platform.name = feature.metadata.platform.name || defaultMetadata.platform.name;
                    feature.metadata.platform.version = feature.metadata.platform.version || defaultMetadata.platform.version;
                }

                // device
                feature.metadata.device = feature.metadata.device || defaultMetadata.device;

                // also add a simple top-level browser field for compatibility if needed
                feature.browser = feature.browser || feature.metadata.browser.name;
            });
        } else if (typeof content === 'object' && content !== null) {
            // not typical; wrap or ensure metadata exists
            content.metadata = content.metadata || defaultMetadata;
            if (typeof content.metadata.browser === 'string') {
                content.metadata.browser = { name: content.metadata.browser, version: '' };
            }
            content.metadata.browser.name = content.metadata.browser.name || defaultMetadata.browser.name;
            content.metadata.platform = content.metadata.platform || defaultMetadata.platform;
            content.metadata.device = content.metadata.device || defaultMetadata.device;
        }

        // write merged file
        const base = path.basename(jf).replace(/[^a-zA-Z0-9_.-]/g, '_');
        const outName = `${String(idx).padStart(3, '0')}-${base}`;
        const outPath = path.join(mergedJsonDir, outName);
        fs.writeFileSync(outPath, JSON.stringify(content, null, 2), 'utf8');
    } catch (err) {
        console.error('Error processing', jf, err && err.stack ? err.stack : err);
    }
});

console.log('Merged JSON files written to', mergedJsonDir);

// generate HTML report using mergedJsonDir as jsonDir
try {
    generate({
        jsonDir: mergedJsonDir,
        reportPath: outDir,
        metadata: {
            browser: {
                name: 'aggregate',
                version: ''
            },
            device: 'CI',
            platform: {
                name: process.env.OS || process.platform || 'linux',
                version: process.version || ''
            }
        },
        customData: {
            title: 'Playwright Cucumber Report (aggregated)',
            data: [
                { label: 'Project', value: process.env.GITHUB_REPOSITORY || 'local' },
                { label: 'Branch', value: process.env.GITHUB_REF || 'local' },
                { label: 'Parallel workers', value: process.env.PARALLEL_WORKERS || 'n/a' }
            ]
        },
        // appearance options (tune as needed)
        displayDuration: true,
        durationInMS: true
    });

    console.log('HTML report generated at', outDir);
} catch (err) {
    console.error('Report generation failed:', err && (err.stack || err.message || err));
    process.exit(1);
}
