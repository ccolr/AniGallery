(function (root, factory) {
    var homeUrl = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = homeUrl;
    }

    if (root) {
        homeUrl.normalise(root);
    }
}(typeof window !== 'undefined' ? window : null, function () {
    if (typeof require === 'function') {
        try {
            return require('./clean-url.js');
        } catch (e) {}
    }

    return {
        cleanUrl: function (location) {
            if (!location || location.protocol === 'file:') return null;
            var pathname = String(location.pathname || '');
            if (/\/index\.html$/i.test(pathname)) {
                return pathname.replace(/index\.html$/i, '') + String(location.search || '') + String(location.hash || '');
            }
            if (/\.html$/i.test(pathname)) {
                return pathname.replace(/\.html$/i, '') + String(location.search || '') + String(location.hash || '');
            }
            return null;
        },
        normalise: function (browserWindow) {
            if (!browserWindow || !browserWindow.location) return;
            var url = this.cleanUrl(browserWindow.location);
            if (url && browserWindow.history && browserWindow.history.replaceState) {
                browserWindow.history.replaceState(null, '', url);
            }
        }
    };
}));
