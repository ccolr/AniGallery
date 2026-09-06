const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const search = require('../js/title-search.js');
const homeUrl = require('../js/home-url.js');

test('matches a trimmed query against the title only', () => {
    assert.equal(search.titleMatches('千与千寻剧情介绍', ' 千与千寻 '), true);
    assert.equal(search.titleMatches('千与千寻剧情介绍', '神灵世界'), false);
});

test('title matching is case-insensitive', () => {
    assert.equal(search.titleMatches('Howl Moving Castle', 'howl'), true);
});

test('the home page loads and identifies the title search and candidate list', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const script = fs.readFileSync(path.join(__dirname, '..', 'js', 'title-search.js'), 'utf8');

    assert.match(html, /id="title-search"/);
    assert.match(html, /id="title-search-results"/);
    assert.match(html, /aria-controls="title-search-results"/);
    assert.match(html, /js\/title-search\.js/);
    assert.doesNotMatch(script, /mixitup|search-match/);
});

test('home links use the clean directory URL', () => {
    const htmlFiles = fs.readdirSync(path.join(__dirname, '..'))
        .filter((file) => file.endsWith('.html'));

    htmlFiles.forEach((file) => {
        const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
        assert.doesNotMatch(html, /href=["']index\.html["']/);
    });
});

test('an explicit index.html URL is normalised without losing URL details', () => {
    assert.equal(homeUrl.cleanUrl({
        pathname: '/index.html',
        search: '?from=bookmark',
        hash: '#gallery'
    }), '/?from=bookmark#gallery');

    assert.equal(homeUrl.cleanUrl({
        pathname: '/AniGallery/index.HTML',
        search: '',
        hash: ''
    }), '/AniGallery/');

    assert.equal(homeUrl.cleanUrl({
        pathname: '/about.html',
        search: '',
        hash: ''
    }), null);
});
