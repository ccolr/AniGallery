const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const htmlPages = fs.readdirSync(path.join(__dirname, '..'))
    .filter((file) => file.endsWith('.html'));

test('pages do not reset the scroll position when the window finishes loading', () => {
    htmlPages.forEach((file) => {
        const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

        assert.doesNotMatch(
            html,
            /addEventListener\(["']load["'][\s\S]*?window\.scrollTo\(0,\s*1\)/,
            `${file} must not scroll to the top from a window load handler`
        );
    });
});
