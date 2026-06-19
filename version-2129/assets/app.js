(() => {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-site-search]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input[name='q']");
      const value = input ? input.value.trim() : "";
      if (value) {
        window.location.href = `./search.html?q=${encodeURIComponent(value)}`;
      }
    });
  });

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;
    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle("is-active", idx === current));
      dots.forEach((dot, idx) => dot.classList.toggle("is-active", idx === current));
    };
    dots.forEach((dot, idx) => dot.addEventListener("click", () => show(idx)));
    if (slides.length > 1) {
      setInterval(() => show(current + 1), 5200);
    }
  }

  const list = document.querySelector("[data-card-list]");
  const keywordInput = document.querySelector("[data-card-filter]");
  const yearFilter = document.querySelector("[data-year-filter]");
  const typeFilter = document.querySelector("[data-type-filter]");
  if (list && keywordInput) {
    const cards = Array.from(list.querySelectorAll("[data-card]"));
    const syncOptions = () => {
      if (yearFilter && yearFilter.options.length <= 1) {
        const years = [...new Set(cards.map((card) => card.dataset.year).filter(Boolean))].sort().reverse();
        years.slice(0, 30).forEach((year) => yearFilter.add(new Option(year, year)));
      }
      if (typeFilter && typeFilter.options.length <= 1) {
        const types = [...new Set(cards.map((card) => card.dataset.type).filter(Boolean))].sort();
        types.forEach((type) => typeFilter.add(new Option(type, type)));
      }
    };
    const apply = () => {
      const keyword = keywordInput.value.trim().toLowerCase();
      const year = yearFilter ? yearFilter.value : "";
      const type = typeFilter ? typeFilter.value : "";
      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const okKeyword = !keyword || text.includes(keyword);
        const okYear = !year || card.dataset.year === year;
        const okType = !type || card.dataset.type === type;
        card.hidden = !(okKeyword && okYear && okType);
      });
    };
    syncOptions();
    keywordInput.addEventListener("input", apply);
    if (yearFilter) yearFilter.addEventListener("change", apply);
    if (typeFilter) typeFilter.addEventListener("change", apply);
  }

  const pageSearchForm = document.querySelector("[data-search-page-form]");
  const pageSearchInput = pageSearchForm ? pageSearchForm.querySelector("input[name='q']") : null;
  const resultsBlock = document.querySelector("[data-search-results-block]");
  const results = document.querySelector("[data-search-results]");
  const defaultBlock = document.querySelector("[data-search-default]");
  const heading = document.querySelector("[data-search-heading]");

  const safe = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");

  const renderSearch = (query) => {
    if (!results || !window.SEARCH_INDEX) return;
    const keyword = query.trim().toLowerCase();
    if (!keyword) return;
    const found = window.SEARCH_INDEX.filter((item) => {
      return `${safe(item.title)} ${safe(item.region)} ${safe(item.type)} ${safe(item.year)} ${item.genre} ${item.tags} ${safe(item.oneLine)}`.toLowerCase().includes(keyword);
    }).slice(0, 60);
    results.innerHTML = found.map((item) => `
      <article class="movie-card">
        <a href="./${safe(item.file)}" class="movie-card-cover" aria-label="${safe(item.title)}">
          <img src="${safe(item.cover)}" alt="${safe(item.title)}" loading="lazy">
          <span class="movie-year">${safe(item.year)}</span>
          <span class="movie-play">▶</span>
        </a>
        <div class="movie-card-body">
          <a href="./${safe(item.file)}" class="movie-card-title">${safe(item.title)}</a>
          <p class="movie-card-desc line-clamp-2">${safe(item.oneLine)}</p>
          <div class="movie-meta">
            <span>${safe(item.region)}</span>
            <span>${safe(item.type)}</span>
          </div>
        </div>
      </article>`).join("");
    if (heading) heading.textContent = `搜索结果：${query}`;
    if (resultsBlock) resultsBlock.hidden = false;
    if (defaultBlock) defaultBlock.hidden = true;
  };

  if (pageSearchForm && pageSearchInput) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    pageSearchInput.value = initial;
    renderSearch(initial);
    pageSearchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = pageSearchInput.value.trim();
      if (query) {
        history.replaceState(null, "", `./search.html?q=${encodeURIComponent(query)}`);
        renderSearch(query);
      }
    });
    document.querySelectorAll("[data-search-suggest]").forEach((button) => {
      button.addEventListener("click", () => {
        pageSearchInput.value = button.dataset.searchSuggest || "";
        pageSearchForm.dispatchEvent(new Event("submit", { cancelable: true }));
      });
    });
  }
})();
