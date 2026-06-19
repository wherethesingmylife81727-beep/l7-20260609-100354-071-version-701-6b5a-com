(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll(".filter-panel").forEach(function (panel) {
            var target = document.querySelector(panel.getAttribute("data-filter-target"));
            if (!target) {
                return;
            }

            var input = panel.querySelector("[data-filter-input]");
            var region = panel.querySelector("[data-filter-region]");
            var type = panel.querySelector("[data-filter-type]");
            var year = panel.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");

            if (q && input) {
                input.value = q;
            }

            function normalize(value) {
                return (value || "").toString().trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(input && input.value);
                var regionValue = region ? region.value : "";
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var matched = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }

                    if (regionValue && card.getAttribute("data-region") !== regionValue) {
                        matched = false;
                    }

                    if (typeValue && card.getAttribute("data-type") !== typeValue) {
                        matched = false;
                    }

                    if (yearValue && card.getAttribute("data-year") !== yearValue) {
                        matched = false;
                    }

                    card.classList.toggle("hidden-card", !matched);
                });
            }

            [input, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    });
})();
