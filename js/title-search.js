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
        var $input = $form.find('[name="query"]');
        var $results = $('#title-search-results');
        var $items = $('#portfoliolist').find('.portfolio');

        function closeResults() {
            $results.removeClass('is-open').empty();
            $input.attr('aria-expanded', 'false');
        }

        function findMatches(query) {
            var matches = [];

            $items.each(function () {
                var $item = $(this);
                var title = $item.find('h5').text();

                if (titleMatches(title, query)) {
                    matches.push({
                        title: title,
                        href: $item.find('a').first().attr('href')
                    });
                }
            });

            return matches;
        }

        function showCandidates(query) {
            var matches;

            if (!normalise(query)) {
                closeResults();
                return [];
            }

            matches = findMatches(query);
            $results.empty();

            if (matches.length) {
                $.each(matches, function (_, match) {
                    $('<a></a>').attr('href', match.href).text(match.title)
                        .appendTo($('<li role="option"></li>').appendTo($results));
                });
            } else {
                $('<li class="empty-result" role="option">未找到匹配标题</li>').appendTo($results);
            }

            $results.addClass('is-open');
            $input.attr('aria-expanded', 'true');
            return matches;
        }

        $input.on('input', function () {
            showCandidates($input.val());
        });

        $form.on('submit', function (event) {
            var query = $input.val();

            event.preventDefault();
            showCandidates(query);
        });

        $input.on('keydown', function (event) {
            if (event.key === 'Escape') {
                closeResults();
            }
        });

        $(document).on('click', function (event) {
            if (!$(event.target).closest('.search').length) {
                closeResults();
            }
        });
    }

    return {
        init: init,
        titleMatches: titleMatches
    };
}));
