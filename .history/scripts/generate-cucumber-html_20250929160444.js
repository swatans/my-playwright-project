// scripts/generate-cucumber-html.js
const fs = require('fs');
const path = require('path');
const { generate } = require('multiple-cucumber-html-reporter');

const srcJsonRoot = path.resolve(process.cwd(), 'reports', 'json');      // input artifacts (may contain subfolders)
const mergedJsonDir = path.resolve(process.cwd(), 'reports', 'json-merged'); // temp dir to feed reporter
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

// utility: derive browser name from path or filename
function detectBrowserFromPath(filepath) {
    const lower = filepath.toLowerCase();
    // common patterns: report-json-chromium, result-chromium-...
    if (lower.includes('chromium')) return 'chromium';
    if (lower.includes('firefox')) return 'firefox';
    if (lower.includes('webkit')) return 'webkit';
    // fallback to 'auto' if unknown
    return 'auto';
}

// make merged dir
if (!fs.existsSync(mergedJsonDir)) fs.mkdirSync(mergedJsonDir, { recursive: true });

const jsonFiles = collectJsonFilesRecursive(srcJsonRoot);
if (jsonFiles.length === 0) {
    console.error('No JSON reports found in', srcJsonRoot);
    process.exit(1);
}

console.log('Found JSON files:', jsonFiles);

// For each json file: read, ensure it's JSON array, add metadata.browser on each feature (or top-level), then write to merged dir
jsonFiles.forEach((jf, idx) => {
    try {
        const raw = fs.readFileSync(jf, 'utf8');
        const content = JSON.parse(raw);

        // detect browser
        const browserName = detectBrowserFromPath(jf);

        // The cucumber json format is an array of feature objects.
        // multiple-cucumber-html-reporter reads metadata from each feature or from the combined array.
        // We'll add a top-level metadata property to each feature object to ensure reporter can show per-browser info.
        if (Array.isArray(content)) {
            content.forEach(feature => {
                // set metadata object; keep existing keys if any
                feature.metadata = feature.metadata || {};
                // If reporter expects metadata.browser nested under 'browser.name', also set that:
                feature.metadata.browser = feature.metadata.browser || {};
                // Some versions expect metadata.browser.name; keep both for compatibility
                if (typeof feature.metadata.browser === 'object') {
                    feature.metadata.browser.name = feature.metadata.browser.name || browserName;
                } else {
                    // if metadata.browser was a string, override to object
                    feature.metadata.browser = { name: browserName };
                }
                // also set top-level simple field for safety
                feature.browser = feature.browser || browserName;
            });
        } else if (typeof content === 'object') {
            // not typical but handle gracefully
            content.metadata = content.metadata || {};
            content.metadata.browser = content.metadata.browser || { name: detectBrowserFromPath(jf) };
        }

        // write merged file with same basename to merged dir (avoid name collisions by prefixing idx)
        const base = path.basename(jf).replace(/[^a-zA-Z0-9_.-]/g, '_');
        const outName = `${idx.toString().padStart(3, '0')}-${base}`;
        fs.writeFileSync(path.join(mergedJsonDir, outName), JSON.stringify(content, null, 2), 'utf8');
    } catch (err) {
        console.error('Error processing', jf, err);
    }
});

console.log('Merged JSON files written to', mergedJsonDir);

// Now generate report from mergedJsonDir
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
            name: process.platform,
            version: process.version
        }
    },
    customData: {
        title: 'Playwright Cucumber Report (aggregated)',
        data: [
            { label: 'Project', value: process.env.GITHUB_REPOSITORY || 'local' },
            { label: 'Branch', value: process.env.GITHUB_REF || 'local' },
            { label: 'Parallel workers', value: process.env.PARALLEL_WORKERS || 'n/a' }
        ]
    }
});

console.log('HTML report generated at', outDir);
