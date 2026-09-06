const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const search = require('../js/title-search.js');

test('matches a trimmed query against the title only', () => {
    assert.equal(search.titleMatches('千与千寻剧情介绍', ' 千与千寻 '), true);
    assert.equal(search.titleMatches('千与千寻剧情介绍', '神灵世界'), false);
});

test('title matching is case-insensitive', () => {
    assert.equal(search.titleMatches('Howl Moving Castle', 'howl'), true);
});

test('the home page loads and identifies the title search', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

    assert.match(html, /id="title-search"/);
    assert.match(html, /js\/title-search\.js/);
});
