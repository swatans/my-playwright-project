// scripts/generate-cucumber-html.js
const report = require('multiple-cucumber-html-reporter');
const fs = require('fs');

const inputJson = 'reports/cucumber.json';
if (!fs.existsSync(inputJson)) {
    console.error('No cucumber.json found, skipping HTML report generation.');
    process.exit(1);
}

report.generate({
    jsonDir: 'reports',
    reportPath: 'reports/html',
    metadata: {
        browser: { name: 'chromium', version: 'auto' },
        device: 'Local machine',
        platform: { name: process.platform }
    },
    customData: {
        title: 'Run info',
        data: [
            { label: 'Project', value: 'My Playwright BDD' },
            { label: 'Execution Time', value: new Date().toISOString() }
        ]
    }
});
console.log('HTML report generated at reports/html/index.html');
