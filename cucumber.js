module.exports = {
    default: {
        require: [
            'tests/support/world.js',
            'tests/support/hooks.js',
            'tests/steps/**/*.js',
            'tests/pages/**/*.js'
        ],
        format: [
            'progress',
            'json:reports/cucumber.json'
        ],
        publishQuiet: true,
        paths: ['tests/features/**/*.feature']
    },
    debug: {
        require: [
            'tests/support/world.js',
            'tests/support/hooks.js',
            'tests/steps/**/*.js',
            'tests/pages/**/*.js'
        ],
        format: ['progress'],
        paths: ['tests/features/**/*.feature'],
        retry: 0,
        parallel: 1,
        /* run headed via env: HEADLESS=false */
    },
    parallel: {
        require: [
            'tests/support/world.js',
            'tests/support/hooks.js',
            'tests/steps/**/*.js',
            'tests/pages/**/*.js'
        ],
        format: [
            'progress',
            'json:reports/cucumber-parallel-%p.json'
        ],
        paths: ['tests/features/**/*.feature'],
        parallel: 4
    }
};
