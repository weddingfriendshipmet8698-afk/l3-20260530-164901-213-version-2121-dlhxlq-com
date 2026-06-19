
(function () {
  const catalog = window.CATALOG || [];
  const byId = new Map(catalog.map(item => [item.id, item]));

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function initCarousel() {
    const wrap = qs('[data-carousel]');
    if (!wrap) return;
    const track = qs('.carousel-track', wrap);
    const dots = qsa('.dot', wrap);
    const slides = qsa('.slide', wrap);
    if (!track || !slides.length) return;
    let index = 0;
    const go = (n) => {
      index = (n + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
    slides.forEach((slide, i) => slide.addEventListener('click', () => go(i)));
    go(0);
    const timer = setInterval(() => go(index + 1), 5500);
    wrap.addEventListener('mouseenter', () => clearInterval(timer), { once: false });
  }

  function initPlayer() {
    const shell = qs('[data-player-shell]');
    if (!shell) return;
    const video = qs('video', shell);
    const overlay = qs('[data-player-overlay]', shell);
    const play = qs('[data-play]', shell);
    const sources = qsa('[data-source]', shell);
    if (!video) return;
    let hls = null;
    const setSource = (url) => {
      if (window.Hls && window.Hls.isSupported()) {
        if (hls) hls.destroy();
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      sources.forEach(btn => btn.classList.toggle('active', btn.dataset.source === url));
      shell.dataset.current = url;
      overlay && overlay.classList.remove('hidden');
      video.load();
    };
    const first = shell.dataset.stream || (sources[0] && sources[0].dataset.source) || '';
    if (first) setSource(first);
    sources.forEach(btn => btn.addEventListener('click', () => setSource(btn.dataset.source)));
    const start = async () => {
      try {
        await video.play();
        overlay && overlay.classList.add('hidden');
      } catch (e) {
        console.warn(e);
      }
    };
    play && play.addEventListener('click', start);
    overlay && overlay.addEventListener('click', start);
    video.addEventListener('play', () => overlay && overlay.classList.add('hidden'));
    video.addEventListener('pause', () => overlay && overlay.classList.remove('hidden'));
    video.addEventListener('ended', () => overlay && overlay.classList.remove('hidden'));
  }

  function initSearchPage() {
    const page = document.body.dataset.page;
    if (page !== 'search' && page !== 'library') return;
    const input = qs('[data-search-input]');
    const result = qs('[data-search-result]');
    const count = qs('[data-result-count]');
    const hint = qs('[data-result-hint]');
    if (!input || !result) return;
    const url = new URL(location.href);
    const initial = (url.searchParams.get('q') || input.value || '').trim();
    input.value = initial;

    const render = (items, term) => {
      if (count) count.textContent = String(items.length);
      if (hint) hint.textContent = term ? `“${term}” 的搜索结果` : '输入关键词即可检索全部影片标题、类型、地区与简介';
      result.innerHTML = items.length ? items.map(m => `
        <a class="card" href="movie/${m.slug}" style="--hue:${m.hue};">
          <div class="poster" style="height: 210px;">
            <div class="poster-top"><span class="poster-chip">${m.type}</span><span class="poster-chip ghost">${m.year}</span></div>
            <div class="poster-center"><div class="poster-icon">▶</div><div class="poster-title">${m.title.slice(0,12)}</div></div>
            <div class="poster-bottom">${m.region} · ${m.main_genre}</div>
          </div>
          <div class="card-body"><h3>${m.title}</h3><p>${m.one_line}</p><div class="card-foot"><span>${m.region}</span><span>${m.year}</span></div></div>
        </a>
      `).join('') : '<div class="panel">没有找到匹配内容，试试“剧情”“爱情”“悬疑”“2024”“中国大陆”等关键词。</div>';
    };

    const filter = () => {
      const term = input.value.trim().toLowerCase();
      const items = !term ? catalog.slice(0, 48) : catalog.filter(m => {
        const hay = [m.title, m.type, m.region, m.main_genre, (m.genres || []).join(' '), m.one_line, m.summary, m.review].join(' ').toLowerCase();
        return hay.includes(term);
      }).slice(0, 120);
      render(items, input.value.trim());
    };
    input.addEventListener('input', filter);
    filter();
  }

  function initFilters() {
    qsa('[data-filter-group]').forEach(group => {
      const buttons = qsa('[data-filter]', group);
      const items = qsa('[data-item]');
      if (!buttons.length || !items.length) return;
      buttons.forEach(btn => btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.toggle('active', b === btn));
        const key = btn.dataset.filter;
        items.forEach(item => {
          const hit = key === 'all' || item.dataset.genre === key || item.dataset.type === key || item.dataset.bucket === key;
          item.style.display = hit ? '' : 'none';
        });
      }));
    });
  }

  function init() {
    initCarousel();
    initPlayer();
    initSearchPage();
    initFilters();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
