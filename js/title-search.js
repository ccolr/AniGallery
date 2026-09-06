(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(root, require('./site-search-index.js'));
        return;
    }

    var search = factory(root, (root && root.siteSearchArticles) || []);

    root.siteSearch = search;

    if (root && root.jQuery) {
        root.jQuery(function () {
            search.init(root.jQuery);
        });
    }
}(typeof window !== 'undefined' ? window : null, function (root, siteArticles) {
    function normalise(value) {
        return String(value || '').trim().toLocaleLowerCase();
    }

    function titleMatches(title, query) {
        var normTitle = normalise(title);
        var tokens = normalise(query).split(/\s+/).filter(Boolean);
        if (!tokens.length) {
            return false;
        }
        return tokens.every(function (token) {
            return normTitle.indexOf(token) !== -1;
        });
    }

    function getArticlePool(customArticles) {
        if (customArticles && Array.isArray(customArticles) && customArticles.length) {
            return customArticles;
        }
        if (customArticles && typeof customArticles.getArticles === 'function') {
            return customArticles.getArticles();
        }
        if (root && root.siteSearchManager && typeof root.siteSearchManager.getArticles === 'function') {
            return root.siteSearchManager.getArticles();
        }
        if (siteArticles && typeof siteArticles.getArticles === 'function') {
            return siteArticles.getArticles();
        }
        if (Array.isArray(siteArticles)) {
            return siteArticles;
        }
        if (root && root.siteSearchArticles && Array.isArray(root.siteSearchArticles)) {
            return root.siteSearchArticles;
        }
        return [];
    }

    function findMatches(query, articles) {
        if (!normalise(query)) {
            return [];
        }

        var pool = getArticlePool(articles);
        return pool.filter(function (article) {
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

            function navigateTo(href) {
                if (href) {
                    window.location.href = href;
                }
            }

            $input.on('input', function () {
                showCandidates($input.val());
            });

            // 聚焦或点击输入框时，若已有输入内容且未展开，重新展开候选列表
            $input.on('focus click', function () {
                if (normalise($input.val()) && !$results.hasClass('is-open')) {
                    showCandidates($input.val());
                }
            });

            // 表单提交（按回车或点击放大镜图标）自动跳转
            $form.on('submit', function (event) {
                event.preventDefault();
                var query = $input.val();
                var $focusedLink = $results.find('a:focus');
                if ($focusedLink.length && $focusedLink.attr('href')) {
                    navigateTo($focusedLink.attr('href'));
                    return;
                }

                var matches = findMatches(query);
                if (matches.length > 0) {
                    navigateTo(matches[0].href);
                } else {
                    showCandidates(query);
                }
            });

            // 输入框按键监听
            $input.on('keydown', function (event) {
                if (event.key === 'Escape') {
                    closeResults();
                } else if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    if (!$results.hasClass('is-open')) {
                        showCandidates($input.val());
                    }
                    var $firstLink = $results.find('a').first();
                    if ($firstLink.length) {
                        $firstLink.focus();
                    }
                }
            });

            // 候选列表链接键盘上下键循环导航与 ESC 退出
            $results.on('keydown', 'a', function (event) {
                var $links = $results.find('a');
                var currentIndex = $links.index(this);

                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    var nextIndex = (currentIndex + 1) % $links.length;
                    $links.eq(nextIndex).focus();
                } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    if (currentIndex === 0) {
                        $input.focus();
                    } else {
                        $links.eq(currentIndex - 1).focus();
                    }
                } else if (event.key === 'Escape') {
                    closeResults();
                    $input.focus();
                }
            });

            // 全局索引数据后台更新时，实时刷新当前展示的候选结果
            if (root && root.siteSearchManager && typeof root.siteSearchManager.onChange === 'function') {
                root.siteSearchManager.onChange(function () {
                    if ($results.hasClass('is-open')) {
                        showCandidates($input.val());
                    }
                });
            }

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
