const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const search = require('../js/title-search.js');
const siteSearchIndex = require('../js/site-search-index.js');

const projectRoot = path.join(__dirname, '..');
const htmlPages = fs.readdirSync(projectRoot)
    .filter((file) => file.endsWith('.html'));

test('every page exposes the same functional site search', () => {
    htmlPages.forEach((file) => {
        const html = fs.readFileSync(path.join(projectRoot, file), 'utf8');

        assert.match(html, /class="site-search-form"/, `${file} needs the shared search form`);
        assert.match(html, /class="title-search-results"/, `${file} needs a search results list`);
        assert.match(html, /js\/site-search-index\.js/, `${file} needs the shared article index`);
        assert.match(html, /js\/title-search\.js/, `${file} needs the shared search behaviour`);
        assert.ok(
            html.indexOf('js/site-search-index.js') < html.indexOf('js/title-search.js'),
            `${file} must load the article index before the search behaviour`
        );
    });
});

test('site search does not depend on home-page portfolio cards', () => {
    const script = fs.readFileSync(path.join(projectRoot, 'js', 'title-search.js'), 'utf8');

    assert.doesNotMatch(script, /#portfoliolist|\.portfolio/);
});

test('the shared search index contains every article listed in blog', () => {
    const blog = fs.readFileSync(path.join(projectRoot, 'blog.html'), 'utf8');
    const blogArticles = Array.from(blog.matchAll(
        /<a class="fast" href="([^"]+)">\s*([^<]+?)\s*<\/a>/g
    ), (match) => ({
        title: match[2].trim(),
        href: match[1]
    }));

    assert.deepEqual(siteSearchIndex, blogArticles);
});

test('a query searches the complete shared article index', () => {
    assert.deepEqual(search.findMatches(' 千与千寻 '), [
        { title: '千与千寻剧情介绍', href: 'plot_qian.html' },
        { title: '千与千寻视频欣赏', href: 'video_qian.html' }
    ]);
    assert.deepEqual(search.findMatches(''), []);
});
