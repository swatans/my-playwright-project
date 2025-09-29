// scripts/generate-cucumber-html.js
const fs = require('fs');
const path = require('path');
const { generate } = require('multiple-cucumber-html-reporter');

const jsonDir = path.resolve(process.cwd(), 'reports', 'json');
const outDir = path.resolve(process.cwd(), 'reports', 'html');

// collect json files recursively
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

const jsonFiles = collectJsonFilesRecursive(jsonDir);

if (jsonFiles.length === 0) {
    console.error('No JSON reports found in', jsonDir);
    // extra debug: list directory tree if present
    if (fs.existsSync(jsonDir)) {
        function printTree(dir, prefix = '') {
            const list = fs.readdirSync(dir, { withFileTypes: true });
            for (const it of list) {
                const p = path.join(dir, it.name);
                console.error(prefix + it.name + (it.isDirectory() ? '/' : ''));
                if (it.isDirectory()) printTree(p, prefix + '  ');
            }
        }
        console.error('Directory tree for', jsonDir, ':');
        printTree(jsonDir, '  ');
    }
    process.exit(1);
}

console.log('Found JSON files:', jsonFiles);

generate({
    jsonDir, // multiple-cucumber-html-reporter will still scan jsonDir, but we list files for debug
    reportPath: outDir,
    // If the reporter supports passing jsonFileArray, you could pass jsonFiles,
    // but generate() will just read jsonDir. We provide metadata and customData.
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
