// scripts/generate-cucumber-html.js
const fs = require('fs');
const path = require('path');
const { generate } = require('multiple-cucumber-html-reporter');

const jsonDir = path.resolve(process.cwd(), 'reports', 'json');
const outDir = path.resolve(process.cwd(), 'reports', 'html');

// collect json files
function collectJsonFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(dir, f));
}

const jsonFiles = collectJsonFiles(jsonDir);

if (jsonFiles.length === 0) {
    console.error('No JSON reports found in', jsonDir);
    process.exit(1);
}

console.log('Found JSON files:', jsonFiles);

generate({
    jsonDir,
    reportPath: outDir,
    metadata: {
        browser: {
            name: process.env.BROWSER || 'matrix',
            version: ''
        },
        device: 'CI',
        platform: {
            name: process.platform,
            version: process.version
        }
    },
    customData: {
        title: 'Playwright Cucumber Report',
        data: [
            { label: 'Project', value: process.env.GITHUB_REPOSITORY || 'local' },
            { label: 'Branch', value: process.env.GITHUB_REF || 'local' },
            { label: 'Parallel workers', value: process.env.PARALLEL_WORKERS || 'n/a' }
        ]
    }
});

console.log('HTML report generated at', outDir);
