(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHero(hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  document.querySelectorAll('[data-hero]').forEach(setupHero);

  function setupFilters(scope) {
    var search = scope.querySelector('[data-search-input]');
    var year = scope.querySelector('[data-filter-year]');
    var category = scope.querySelector('[data-filter-category]');
    var list = document.querySelector('[data-movie-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function textOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var categoryValue = category ? category.value.toLowerCase() : '';

      cards.forEach(function (card) {
        var text = textOf(card);
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchesCategory = !categoryValue || text.indexOf(categoryValue) !== -1;
        card.classList.toggle('is-hidden', !(matchesKeyword && matchesYear && matchesCategory));
      });
    }

    if (search) {
      search.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (category) {
      category.addEventListener('change', apply);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(setupFilters);

  function setupPlayer(shell) {
    var video = shell.querySelector('video[data-src]');
    var button = shell.querySelector('[data-player-start]');
    var source = video ? video.getAttribute('data-src') : '';
    var ready = false;

    function attach() {
      if (!video || ready || !source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        ready = true;
        return;
      }
      video.src = source;
      ready = true;
    }

    function play() {
      attach();
      if (button) {
        button.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', attach);
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  }

  document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
