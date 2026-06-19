(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
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

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restartTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartTimer();
      });
    });

    startTimer();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var countTarget = filterPanel.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = yearSelect ? yearSelect.value : '';
      var visibleCount = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags')
        ].join(' '));
        var yearMatched = !year || card.getAttribute('data-year') === year;
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var visible = yearMatched && keywordMatched;
        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });
      if (countTarget) {
        countTarget.textContent = String(visibleCount);
      }
    }

    if (keywordInput) {
      keywordInput.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
  }

  var searchResults = document.getElementById('search-results');
  if (searchResults && Array.isArray(window.SEARCH_INDEX)) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = document.getElementById('search-page-input');
    var heading = document.getElementById('search-heading');
    if (input) {
      input.value = query;
    }

    function normalizeSearch(value) {
      return String(value || '').toLowerCase().trim();
    }

    function renderCard(item) {
      var tags = item.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '  <a class="card-cover" href="' + escapeHtml(item.url) + '">',
        '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="card-year">' + escapeHtml(item.year) + '</span>',
        '    <span class="card-play">立即播放</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <a class="card-title" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '    <div class="card-tags">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    var normalizedQuery = normalizeSearch(query);
    var matched = window.SEARCH_INDEX.filter(function (item) {
      if (!normalizedQuery) {
        return true;
      }
      return normalizeSearch([
        item.title,
        item.region,
        item.year,
        item.type,
        item.category,
        item.tags.join(' '),
        item.oneLine
      ].join(' ')).indexOf(normalizedQuery) !== -1;
    }).slice(0, 160);

    if (heading) {
      heading.textContent = normalizedQuery ? '“' + query + '” 的搜索结果' : '全部内容';
    }
    searchResults.innerHTML = matched.map(renderCard).join('') || '<p class="content-card">未找到匹配内容</p>';
  }
})();

function initializeMoviePlayer(sourceUrl) {
  var video = document.querySelector('.movie-player');
  var cover = document.querySelector('.player-cover');
  if (!video || !cover || !sourceUrl) {
    return;
  }

  var hlsInstance = null;
  var loaded = false;

  function attachSource() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function playVideo() {
    attachSource();
    cover.classList.add('is-hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  cover.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener('play', function () {
    cover.classList.add('is-hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
