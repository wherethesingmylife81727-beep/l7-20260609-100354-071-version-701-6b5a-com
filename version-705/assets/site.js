import { H as Hls } from "./hls-vendor-dru42stk.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMenu() {
  const button = $("[data-menu-toggle]");
  const nav = $("[data-site-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
}

function setupSearchForms() {
  $$('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = form.querySelector('input[name="q"], [data-search-input]');
      const value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
      }
    });
  });
}

function setupHero() {
  const hero = $('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = $$('[data-hero-slide]', hero);
  const dots = $$('[data-hero-dot]', hero);
  if (slides.length <= 1) {
    return;
  }
  let index = 0;
  const activate = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => activate(i));
  });
  window.setInterval(() => activate(index + 1), 5200);
}

function setupFilters() {
  const search = $('[data-page-search]');
  const category = $('[data-category-filter]');
  const sort = $('[data-sort-select]');
  const count = $('[data-result-count]');
  const grid = $('[data-grid]');
  const cards = $$('[data-filter-card]');
  if (!grid || cards.length === 0 || (!search && !category && !sort)) {
    return;
  }

  const apply = () => {
    const query = search ? search.value.trim().toLowerCase() : '';
    const categoryValue = category ? category.value : 'all';
    const sortValue = sort ? sort.value : 'latest';

    let visibleCards = cards.filter((card) => {
      const matchesQuery = !query || (card.dataset.terms || '').includes(query);
      const matchesCategory = categoryValue === 'all' || card.dataset.category === categoryValue;
      return matchesQuery && matchesCategory;
    });

    visibleCards.sort((a, b) => {
      if (sortValue === 'popular') {
        return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
      }
      if (sortValue === 'title') {
        return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
      }
      return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
    });

    cards.forEach((card) => {
      card.hidden = true;
    });
    visibleCards.forEach((card) => {
      card.hidden = false;
      grid.appendChild(card);
    });
    if (count) {
      count.textContent = String(visibleCards.length);
    }
  };

  [search, category, sort].filter(Boolean).forEach((control) => {
    control.addEventListener('input', apply);
    control.addEventListener('change', apply);
  });
  apply();
}

function setupPlayers() {
  $$('[data-player]').forEach((panel) => {
    const video = $('video', panel);
    const button = $('[data-play-button]', panel);
    const source = panel.dataset.video;
    let loaded = false;

    const loadAndPlay = async () => {
      if (!video || !source) {
        return;
      }
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          panel.hlsInstance = hls;
        } else {
          video.src = source;
        }
        loaded = true;
      }
      panel.classList.add('is-playing');
      video.controls = true;
      try {
        await video.play();
      } catch (error) {
        video.controls = true;
      }
    };

    if (button) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        loadAndPlay();
      });
    }
    panel.addEventListener('click', (event) => {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
        return;
      }
      loadAndPlay();
    });
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderSearchCard(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  return `
      <article class="movie-card">
        <a class="card-media" href="./${escapeHtml(movie.file)}" aria-label="观看 ${escapeHtml(movie.title)}">
          <img src="${escapeHtml(movie.image)}" alt="${escapeHtml(movie.title)}" loading="lazy">
          <span class="year-badge">${escapeHtml(movie.year)}</span>
          <span class="type-badge">${escapeHtml(movie.type)}</span>
        </a>
        <div class="card-body">
          <div class="card-meta">
            <span>${escapeHtml(movie.region)}</span>
            <span>${escapeHtml(movie.category)}</span>
          </div>
          <h3><a href="./${escapeHtml(movie.file)}">${escapeHtml(movie.title)}</a></h3>
          <p>${escapeHtml(movie.oneLine)}</p>
          <div class="tag-row">${tags}</div>
          <div class="card-foot">
            <span>热度 ${escapeHtml(movie.heat)}</span>
            <span>评分 ${escapeHtml(movie.rating)}</span>
          </div>
        </div>
      </article>`;
}

function setupSearchPage() {
  const results = $('#search-results');
  const summary = $('[data-search-summary]');
  const input = $('[data-search-input]');
  const index = window.MOVIE_SEARCH_INDEX || [];
  if (!results || !summary || !input || index.length === 0) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();
  input.value = query;
  if (!query) {
    return;
  }
  const lower = query.toLowerCase();
  const matched = index.filter((movie) => (movie.terms || '').includes(lower));
  summary.textContent = `关键词“${query}”找到 ${matched.length} 部内容`;
  results.innerHTML = matched.slice(0, 240).map(renderSearchCard).join('');
  if (matched.length > 240) {
    summary.textContent += '，已显示前 240 部。';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupMenu();
  setupSearchForms();
  setupHero();
  setupFilters();
  setupPlayers();
  setupSearchPage();
});
