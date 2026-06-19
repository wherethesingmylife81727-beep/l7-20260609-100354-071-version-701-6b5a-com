(function () {
  var input = document.getElementById('search-page-input');
  var form = document.getElementById('search-page-form');
  var results = document.getElementById('search-results');
  var hot = document.getElementById('search-hot');

  if (!input || !form || !results || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    return;
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function createCard(movie) {
    return [
      '<article class="movie-card">',
      '<a class="movie-poster" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-badge">' + movie.year + '</span>',
      '<span class="poster-play">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>评分 ' + movie.rating + '</span></div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="movie-card-footer"><a href="' + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>',
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

  function render(query) {
    input.value = query;
    var q = query.toLowerCase();
    if (!q) {
      results.innerHTML = '';
      if (hot) {
        hot.classList.remove('is-hidden');
      }
      return;
    }

    var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      return movie.search.indexOf(q) > -1;
    }).slice(0, 240);

    if (hot) {
      hot.classList.add('is-hidden');
    }

    if (!matched.length) {
      results.innerHTML = '<div class="empty-state">暂未找到相关影片</div>';
      return;
    }

    results.innerHTML = matched.map(createCard).join('');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
    history.replaceState(null, '', url);
    render(query);
  });

  render(getQuery());
})();
