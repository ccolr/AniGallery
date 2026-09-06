(function (root, factory) {
    var cleanUrl = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = cleanUrl;
    }

    if (root) {
        cleanUrl.init(root);
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

    function cleanHref(href) {
        if (!href) return href;
        if (/^(https?:|\/\/|mailto:|javascript:|#)/i.test(href)) return href;
        return href.replace(/index\.html(\?|#|$)/i, './$1').replace(/\.html(\?|#|$)/i, '$1');
    }

    function init(browserWindow) {
        if (!browserWindow || !browserWindow.location) return;
        normalise(browserWindow);

        // 如果是本地 file:// 协议，保持原样以便离线点击
        if (browserWindow.location.protocol === 'file:') return;

        var doc = browserWindow.document;
        if (!doc) return;

        function updateAnchors() {
            var links = doc.querySelectorAll('a[href*=".html"]');
            for (var i = 0; i < links.length; i++) {
                var raw = links[i].getAttribute('href');
                if (raw && /\.html/i.test(raw)) {
                    links[i].setAttribute('href', cleanHref(raw));
                }
            }
        }

        if (doc.readyState === 'loading') {
            doc.addEventListener('DOMContentLoaded', updateAnchors);
        } else {
            updateAnchors();
        }

        // 委托捕获点击事件，确保动态生成的元素（如搜索结果下拉列表）点击时也是无后缀直接跳转
        doc.addEventListener('click', function (event) {
            var target = event.target;
            while (target && target !== doc.body) {
                if (target.tagName === 'A') {
                    var href = target.getAttribute('href');
                    if (href && /\.html/i.test(href)) {
                        target.setAttribute('href', cleanHref(href));
                    }
                    break;
                }
                target = target.parentNode;
            }
        }, true);
    }

    return {
        cleanUrl: getCleanUrl,
        getCleanUrl: getCleanUrl,
        cleanHref: cleanHref,
        normalise: normalise,
        init: init
    };
}));
