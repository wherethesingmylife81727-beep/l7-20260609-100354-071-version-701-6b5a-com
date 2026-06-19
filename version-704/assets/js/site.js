(function () {
  var menuButton = document.querySelector('[data-mobile-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        startTimer();
      });
    }

    show(0);
    startTimer();
  }

  var filterInput = document.getElementById('movie-filter-input');
  var typeFilter = document.getElementById('type-filter');
  var yearFilter = document.getElementById('year-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var type = typeFilter ? typeFilter.value : '';
    var year = yearFilter ? yearFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var search = (card.getAttribute('data-search') || '').toLowerCase();
      var cardTitle = (card.getAttribute('data-title') || '').toLowerCase();
      var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
      var cardGenre = (card.getAttribute('data-genre') || '').toLowerCase();
      var cardType = card.getAttribute('data-type') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var textMatch = !query || search.indexOf(query) > -1 || cardTitle.indexOf(query) > -1 || cardRegion.indexOf(query) > -1 || cardGenre.indexOf(query) > -1;
      var typeMatch = !type || cardType === type;
      var yearMatch = !year || cardYear === year;
      var shouldShow = textMatch && typeMatch && yearMatch;
      card.classList.toggle('is-filter-hidden', !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    var grid = cards[0] ? cards[0].parentElement : null;
    var empty = document.getElementById('filter-empty-state');
    if (!empty && grid) {
      empty = document.createElement('div');
      empty.id = 'filter-empty-state';
      empty.className = 'empty-state';
      empty.textContent = '暂未找到匹配影片';
      grid.appendChild(empty);
    }
    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }
  if (typeFilter) {
    typeFilter.addEventListener('change', applyFilters);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }
})();
