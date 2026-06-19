(function() {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-nav-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function() {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('.js-hero');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var next = hero.querySelector('[data-hero-next]');
        var prev = hero.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (next) {
            next.addEventListener('click', function() {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function() {
                show(index - 1);
                start();
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('.filter-scope'));
        scopes.forEach(function(scope) {
            var input = scope.querySelector('.js-filter-input');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-card'));
            var empty = scope.querySelector('.filter-empty');
            if (!input || !cards.length) {
                return;
            }
            var initialQuery = getQuery();
            if (initialQuery) {
                input.value = initialQuery;
            }

            function applyFilter() {
                var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
                var visibleCount = 0;
                cards.forEach(function(card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var matched = words.every(function(word) {
                        return haystack.indexOf(word) !== -1;
                    });
                    card.hidden = !matched;
                    if (matched) {
                        visibleCount += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visibleCount !== 0;
                }
            }

            input.addEventListener('input', applyFilter);
            applyFilter();
        });
    }

    ready(function() {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
