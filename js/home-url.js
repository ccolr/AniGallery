(function (root, factory) {
    var homeUrl = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = homeUrl;
    }

    if (root) {
        homeUrl.normalise(root);
    }
}(typeof window !== 'undefined' ? window : null, function () {
    function cleanUrl(location) {
        var pathname = String(location.pathname || '');

        if (!/\/index\.html$/i.test(pathname)) {
            return null;
        }

        return pathname.replace(/index\.html$/i, '') +
            String(location.search || '') +
            String(location.hash || '');
    }

    function normalise(browserWindow) {
        var url = cleanUrl(browserWindow.location);

        if (url && browserWindow.history && browserWindow.history.replaceState) {
            browserWindow.history.replaceState(null, '', url);
        }
    }

    return {
        cleanUrl: cleanUrl,
        normalise: normalise
    };
}));
