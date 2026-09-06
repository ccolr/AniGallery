(function (root, factory) {
    var manager = factory(root);

    if (typeof module === 'object' && module.exports) {
        module.exports = manager;
    }

    if (root) {
        root.siteSearchManager = manager;
        root.siteSearchArticles = manager.getArticles();
    }
}(typeof window !== 'undefined' ? window : null, function (root) {
    // 基础种子数据（保障初次访问、离线或无服务器 file:// 运行环境）
    var defaultArticles = [
        { title: '千与千寻剧情介绍', href: 'plot_qian.html' },
        { title: '千与千寻视频欣赏', href: 'video_qian.html' },
        { title: '天空之城剧情介绍', href: 'plot_tian.html' },
        { title: '天空之城视频欣赏', href: 'video_tian.html' },
        { title: '哈尔的移动城堡剧情介绍', href: 'plot_cheng.html' },
        { title: '哈尔的移动城堡视频欣赏', href: 'video_cheng.html' },
        { title: '起风了剧情介绍', href: 'plot_feng.html' },
        { title: '起风了视频欣赏', href: 'video_feng.html' }
    ];

    var STORAGE_KEY = 'ani_global_search_index';
    var cachedArticles = null;
    var listeners = [];

    function cleanText(str) {
        return String(str || '').replace(/\s+/g, ' ').trim();
    }

    function cleanHref(href) {
        if (!href) return '';
        var clean = href.split('#')[0].split('?')[0].replace(/^\.\//, '').trim();
        return clean;
    }

    // 过滤去重并合并文章列表
    function mergeArticles(existing, additions) {
        var map = {};
        var result = [];

        function add(item) {
            if (!item || !item.title || !item.href) return;
            var href = cleanHref(item.href);
            var title = cleanText(item.title);
            if (!href || !title) return;

            // 过滤非文章链接（外链、锚点、首页、分类关于页）
            if (/^(https?:|\/\/|mailto:|javascript:)/i.test(href)) return;
            if (href === 'index.html' || href === 'about.html' || href === 'blog.html') return;

            var key = href.toLowerCase();
            if (!map[key]) {
                map[key] = true;
                result.push({ title: title, href: href });
            }
        }

        (existing || []).forEach(add);
        (additions || []).forEach(add);
        return result;
    }

    function readStorage() {
        if (!root || !root.localStorage) return null;
        try {
            var raw = root.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length) {
                    return parsed;
                }
            }
        } catch (e) {}
        return null;
    }

    function writeStorage(articles) {
        if (!root || !root.localStorage) return;
        try {
            root.localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
        } catch (e) {}
    }

    function getArticles() {
        if (cachedArticles && cachedArticles.length) {
            return cachedArticles;
        }
        var fromStorage = readStorage();
        if (fromStorage && fromStorage.length) {
            cachedArticles = mergeArticles(defaultArticles, fromStorage);
        } else {
            cachedArticles = defaultArticles.slice();
        }
        return cachedArticles;
    }

    function setArticles(newArticles) {
        cachedArticles = mergeArticles(defaultArticles, newArticles);
        writeStorage(cachedArticles);
        if (root) {
            root.siteSearchArticles = cachedArticles;
        }
        listeners.forEach(function (fn) {
            try { fn(cachedArticles); } catch (e) {}
        });
    }

    // 从 DOM 对象中动态提取文章（支持 blog.html、index.html 或文章详情页）
    function extractFromDoc(doc) {
        if (!doc) return [];
        var items = [];

        // 1. 博客列表项 (.top-blog a.fast)
        var fastLinks = doc.querySelectorAll('.top-blog a.fast');
        for (var i = 0; i < fastLinks.length; i++) {
            items.push({
                title: cleanText(fastLinks[i].textContent),
                href: fastLinks[i].getAttribute('href')
            });
        }

        // 2. 归档列表项 (.grid-categories .popular li a)
        var popLinks = doc.querySelectorAll('.grid-categories .popular li a, ul.popular li a');
        for (var j = 0; j < popLinks.length; j++) {
            var clone = popLinks[j].cloneNode(true);
            var dots = clone.querySelectorAll('.dot');
            for (var d = 0; d < dots.length; d++) {
                dots[d].parentNode.removeChild(dots[d]);
            }
            items.push({
                title: cleanText(clone.textContent),
                href: popLinks[j].getAttribute('href')
            });
        }

        // 3. 首页卡片项 (#portfoliolist .portfolio-wrapper h5 a)
        var cardTitles = doc.querySelectorAll('#portfoliolist .portfolio-wrapper h5 a');
        for (var k = 0; k < cardTitles.length; k++) {
            items.push({
                title: cleanText(cardTitles[k].textContent),
                href: cardTitles[k].getAttribute('href')
            });
        }

        return items;
    }

    // 自动扫描与动态同步
    function autoSync() {
        if (!root || !root.document) return;

        // 就地提取当前页面中存在的文章项
        var currentItems = extractFromDoc(root.document);
        if (currentItems.length) {
            setArticles(mergeArticles(getArticles(), currentItems));
        }

        // 若不是 blog.html，在后台异步获取 blog.html（全站文章汇总源），实现新文章自动加入索引
        var isBlogPage = /blog\.html/i.test(root.location.pathname);
        if (!isBlogPage && typeof root.fetch === 'function') {
            root.fetch('blog.html')
                .then(function (res) {
                    if (!res.ok) throw new Error('status ' + res.status);
                    return res.text();
                })
                .then(function (html) {
                    if (!html) return;
                    var parser = new root.DOMParser();
                    var doc = parser.parseFromString(html, 'text/html');
                    var fetchedItems = extractFromDoc(doc);
                    if (fetchedItems.length) {
                        setArticles(mergeArticles(getArticles(), fetchedItems));
                    }
                })
                .catch(function () {
                    // 网络异常或本地 file:// 协议受限时静默回退到现有缓存
                });
        }
    }

    // Node.js 环境兼容（例如测试或构建时从 blog.html 自动扫描）
    if (typeof module === 'object' && module.exports && typeof require === 'function') {
        try {
            var fs = require('fs');
            var path = require('path');
            var projectDir = path.resolve(__dirname, '..');
            var blogPath = path.join(projectDir, 'blog.html');
            if (fs.existsSync(blogPath)) {
                var blogHtml = fs.readFileSync(blogPath, 'utf8');
                var matches = Array.from(blogHtml.matchAll(/<a class="fast" href="([^"]+)">\s*([\s\S]*?)\s*<\/a>/g));
                if (matches.length) {
                    var nodeArticles = matches.map(function (m) {
                        return { title: cleanText(m[2]), href: cleanHref(m[1]) };
                    });
                    defaultArticles = mergeArticles(defaultArticles, nodeArticles);
                }
            }
        } catch (err) {}
    }

    // 浏览器环境下 DOM 加载后自动执行同步
    if (root && root.document) {
        if (root.document.readyState === 'loading') {
            root.document.addEventListener('DOMContentLoaded', autoSync);
        } else {
            autoSync();
        }
    }

    return {
        getArticles: getArticles,
        autoSync: autoSync,
        onChange: function (fn) {
            listeners.push(fn);
        },
        mergeArticles: mergeArticles,
        defaultArticles: defaultArticles
    };
}));
