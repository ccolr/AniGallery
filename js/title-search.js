(function (root, factory) {
    var search = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = search;
    }

    if (root && root.jQuery) {
        root.jQuery(function () {
            search.init(root.jQuery);
        });
    }
}(typeof window !== 'undefined' ? window : null, function () {
    function normalise(value) {
        return String(value || '').trim().toLocaleLowerCase();
    }

    function titleMatches(title, query) {
        return normalise(title).indexOf(normalise(query)) !== -1;
    }

    function init($) {
        var $form = $('#title-search');
        var $gallery = $('#portfoliolist');

        $form.on('submit', function (event) {
            var query = $form.find('[name="query"]').val();
            var $items = $gallery.find('.portfolio');

            event.preventDefault();
            $items.removeClass('search-match');

            if (!normalise(query)) {
                $gallery.mixitup('filter', 'all');
                return;
            }

            $items.each(function () {
                var $item = $(this);

                if (titleMatches($item.find('h5').text(), query)) {
                    $item.addClass('search-match');
                }
            });

            $gallery.mixitup('filter', 'search-match');
        });
    }

    return {
        init: init,
        titleMatches: titleMatches
    };
}));
