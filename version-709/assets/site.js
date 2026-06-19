(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
            });
        });

        initHeroCarousel();
        initInlineFilters();
    });

    window.initHeroCarousel = function () {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener("click", function () {
                stop();
                show(current - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                stop();
                show(current + 1);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                stop();
                show(index);
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    };

    function initInlineFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector(".filter-input");
        var yearSelect = panel.querySelector(".filter-year");
        var typeSelect = panel.querySelector(".filter-type");
        var reset = panel.querySelector(".filter-reset");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .wide-card"));
        var empty = document.querySelector(".empty-state");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        function uniqueValues(name) {
            var values = [];
            cards.forEach(function (card) {
                var value = card.getAttribute(name);
                if (value && values.indexOf(value) === -1) {
                    values.push(value);
                }
            });
            return values.sort(function (a, b) {
                return b.localeCompare(a, "zh-CN", { numeric: true });
            });
        }

        function fillSelect(select, values) {
            if (!select) {
                return;
            }
            values.forEach(function (value) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function cardText(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre")
            ].join(" ").toLowerCase();
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var ok = true;
                if (query && cardText(card).indexOf(query) === -1) {
                    ok = false;
                }
                if (year && card.getAttribute("data-year") !== year) {
                    ok = false;
                }
                if (type && card.getAttribute("data-type") !== type) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        fillSelect(yearSelect, uniqueValues("data-year"));
        fillSelect(typeSelect, uniqueValues("data-type"));
        if (input && initialQuery) {
            input.value = initialQuery;
        }
        [input, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                apply();
            });
        }
        apply();
    }

    window.initMoviePlayer = function (videoUrl) {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var overlay = player.querySelector(".player-overlay");
        var started = false;
        var hlsInstance = null;

        function attach() {
            if (started || !videoUrl) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoUrl;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
