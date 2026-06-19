(function () {
    function setupMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = hero.querySelector('[data-hero-dots]');
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function setActive(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });
            if (dots) {
                Array.prototype.slice.call(dots.children).forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === activeIndex);
                });
            }
        }

        function startAuto() {
            clearInterval(timer);
            timer = setInterval(function () {
                setActive(activeIndex + 1);
            }, 5200);
        }

        if (dots) {
            slides.forEach(function (_, index) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换到第' + (index + 1) + '屏');
                dot.addEventListener('click', function () {
                    setActive(index);
                    startAuto();
                });
                dots.appendChild(dot);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                setActive(activeIndex - 1);
                startAuto();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                setActive(activeIndex + 1);
                startAuto();
            });
        }

        setActive(0);
        startAuto();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
        forms.forEach(function (form) {
            var input = form.querySelector('[data-search-input]');
            var list = document.querySelector('[data-search-list]');
            var empty = document.querySelector('[data-empty-state]');
            if (!input || !list) {
                return;
            }
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
            function filterCards() {
                var query = normalize(input.value);
                var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search-card]'));
                var matched = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.textContent
                    ].join(' '));
                    var visible = !query || haystack.indexOf(query) !== -1;
                    card.hidden = !visible;
                    if (visible) {
                        matched += 1;
                    }
                });
                if (empty) {
                    empty.hidden = matched !== 0;
                }
            }
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                filterCards();
            });
            input.addEventListener('input', filterCards);
            filterCards();
        });
    }

    function setupPlayer() {
        var box = document.querySelector('[data-player]');
        if (!box) {
            return;
        }
        var video = box.querySelector('video');
        var button = box.querySelector('.player-start');
        if (!video || !button) {
            return;
        }
        var stream = video.dataset.stream;
        var loaded = false;

        function beginPlayback() {
            if (!stream) {
                return;
            }
            button.classList.add('hidden');
            if (loaded) {
                video.play().catch(function () {});
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = stream;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {});
                }, { once: true });
                video.load();
            }
        }

        button.addEventListener('click', beginPlayback);
        video.addEventListener('click', function () {
            if (!loaded) {
                beginPlayback();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupSearch();
        setupPlayer();
    });
}());
