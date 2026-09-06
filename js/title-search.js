(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./site-search-index.js'));
        return;
    }

    var search = factory(root.siteSearchArticles || []);

    root.siteSearch = search;

    if (root.jQuery) {
        root.jQuery(function () {
            search.init(root.jQuery);
        });
    }
}(typeof window !== 'undefined' ? window : null, function (siteArticles) {
    function normalise(value) {
        return String(value || '').trim().toLocaleLowerCase();
    }

    function titleMatches(title, query) {
        return normalise(title).indexOf(normalise(query)) !== -1;
    }

    function findMatches(query, articles) {
        if (!normalise(query)) {
            return [];
        }

        return (articles || siteArticles).filter(function (article) {
            return titleMatches(article.title, query);
        });
    }

    function init($) {
        $('.site-search-form').each(function () {
            var $form = $(this);
            var $search = $form.closest('.search');
            var $input = $form.find('[name="query"]');
            var $results = $search.find('.title-search-results');

            function closeResults() {
                $results.removeClass('is-open').empty();
                $input.attr('aria-expanded', 'false');
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
                    $('<li class="empty-result" role="option">未找到匹配文章</li>').appendTo($results);
                }

                $results.addClass('is-open');
                $input.attr('aria-expanded', 'true');
                return matches;
            }

            $input.on('input', function () {
                showCandidates($input.val());
            });

            $form.on('submit', function (event) {
                event.preventDefault();
                showCandidates($input.val());
            });

            $input.on('keydown', function (event) {
                if (event.key === 'Escape') {
                    closeResults();
                } else if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    $results.find('a').first().focus();
                }
            });

            $(document).on('click.siteSearch', function (event) {
                if (!$(event.target).closest($search).length) {
                    closeResults();
                }
            });
        });
    }

    return {
        findMatches: findMatches,
        init: init,
        titleMatches: titleMatches
    };
}));
