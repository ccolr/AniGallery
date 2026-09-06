(function (root, factory) {
    var articles = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = articles;
    }

    if (root) {
        root.siteSearchArticles = articles;
    }
}(typeof window !== 'undefined' ? window : null, function () {
    // This list mirrors the article title links in blog.html.
    // tests/site-search.test.js keeps both sources in sync.
    return [
        { title: '千与千寻剧情介绍', href: 'plot_qian.html' },
        { title: '千与千寻视频欣赏', href: 'video_qian.html' },
        { title: '天空之城剧情介绍', href: 'plot_tian.html' },
        { title: '天空之城视频欣赏', href: 'video_tian.html' },
        { title: '哈尔的移动城堡剧情介绍', href: 'plot_cheng.html' },
        { title: '哈尔德移动城堡视频欣赏', href: 'video_cheng.html' },
        { title: '起风了剧情介绍', href: 'plot_feng.html' },
        { title: '起风了视频欣赏', href: 'video_feng.html' }
    ];
}));
