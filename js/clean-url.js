(function (root, factory) {
    var cleanUrl = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = cleanUrl;
    }

    if (root) {
        cleanUrl.normalise(root);
    }
}(typeof window !== 'undefined' ? window : null, function () {
    function getCleanUrl(location) {
        if (!location) return null;
        // 本地 file:// 协议不处理，避免直接双击本地文件打开时刷新报找不到文件
        if (location.protocol === 'file:') return null;

        var pathname = String(location.pathname || '');

        // 1. 如果是 index.html，替换为 /
        if (/\/index\.html$/i.test(pathname)) {
            return pathname.replace(/index\.html$/i, '') +
                String(location.search || '') +
                String(location.hash || '');
        }

        // 2. 如果是其他 .html 页面，移除 .html 后缀
        if (/\.html$/i.test(pathname)) {
            return pathname.replace(/\.html$/i, '') +
                String(location.search || '') +
                String(location.hash || '');
        }

        return null;
    }

    function normalise(browserWindow) {
        if (!browserWindow || !browserWindow.location) return;
        var url = getCleanUrl(browserWindow.location);

        if (url && browserWindow.history && browserWindow.history.replaceState) {
            browserWindow.history.replaceState(null, '', url);
        }
    }

    return {
        cleanUrl: getCleanUrl,
        getCleanUrl: getCleanUrl,
        normalise: normalise
    };
}));
