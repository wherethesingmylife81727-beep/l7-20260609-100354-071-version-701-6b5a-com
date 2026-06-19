document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initLeadSlider();
    initSearchFilter();
});

function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!button || !panel) {
        return;
    }

    button.addEventListener("click", function () {
        panel.classList.toggle("is-open");
    });
}

function initLeadSlider() {
    var wrap = document.querySelector("[data-lead-slider]");

    if (!wrap) {
        return;
    }

    var slides = Array.prototype.slice.call(wrap.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(wrap.querySelectorAll("[data-slide-dot]"));
    var current = 0;

    function show(index) {
        current = index;
        slides.forEach(function (slide, position) {
            slide.classList.toggle("is-active", position === current);
        });
        dots.forEach(function (dot, position) {
            dot.classList.toggle("is-active", position === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            show(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            show((current + 1) % slides.length);
        }, 5200);
    }
}

function initSearchFilter() {
    var forms = document.querySelectorAll("[data-search-form]");

    forms.forEach(function (form) {
        var input = form.querySelector("[data-search-input]");
        var list = document.querySelector("[data-card-list]");
        var empty = document.querySelector("[data-empty-state]");

        if (!input || !list) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter(input, list, empty);
        });

        input.addEventListener("input", function () {
            applyFilter(input, list, empty);
        });
    });
}

function applyFilter(input, list, empty) {
    var query = input.value.trim().toLowerCase();
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .wide-card"));
    var visible = 0;

    cards.forEach(function (card) {
        var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-tags") || "",
            card.textContent || ""
        ].join(" ").toLowerCase();
        var matched = haystack.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
            visible += 1;
        }
    });

    if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
    }
}
