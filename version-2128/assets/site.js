(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMenu() {
        var toggle = qs("[data-menu-toggle]");
        var panel = qs("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa(".hero-slide", hero);
        var dots = qsa("[data-hero-dot]", hero);
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function initSearchForms() {
        qsa(".js-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = qs("input[name='q']", form);
                var value = input ? input.value.trim() : "";
                if (!value) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(value);
            });
        });
    }

    function initLocalFilter() {
        var list = qs("[data-filter-list]");
        if (!list) {
            return;
        }
        var input = qs("[data-filter-input]");
        var region = qs("[data-filter-region]");
        var year = qs("[data-filter-year]");
        var cards = qsa(".movie-card", list);
        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var regionValue = region ? region.value : "";
            var yearValue = year ? year.value : "";
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var visible = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    visible = false;
                }
                if (regionValue && card.getAttribute("data-region") !== regionValue) {
                    visible = false;
                }
                if (yearValue && card.getAttribute("data-year") !== yearValue) {
                    visible = false;
                }
                card.style.display = visible ? "" : "none";
            });
        }
        [input, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function createResultCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHTML(tag) + "</span>";
        }).join("");
        return "<article class="movie-card">" +
            "<a class="poster-link" href="" + escapeHTML(movie.url) + "">" +
            "<img src="" + escapeHTML(movie.cover) + "" alt="" + escapeHTML(movie.title) + "" loading="lazy">" +
            "<span class="poster-shade"></span><span class="play-dot">▶</span></a>" +
            "<div class="movie-card-body"><div class="card-meta">" +
            "<span>" + escapeHTML(movie.region) + "</span><span>" + escapeHTML(movie.year) + "</span><span>" + escapeHTML(movie.type) + "</span>" +
            "</div><h3><a href="" + escapeHTML(movie.url) + "">" + escapeHTML(movie.title) + "</a></h3>" +
            "<p>" + escapeHTML(movie.line) + "</p><div class="tag-row">" + tags + "</div></div></article>";
    }

    function initSearchPage() {
        var results = qs("[data-search-results]");
        var input = qs("[data-search-page-input]");
        if (!results || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (input && query) {
            input.value = query;
        }
        if (!query) {
            return;
        }
        var lower = query.toLowerCase();
        var matched = window.MOVIE_INDEX.filter(function (movie) {
            var haystack = [movie.title, movie.region, movie.type, movie.year, (movie.tags || []).join(" "), movie.line].join(" ").toLowerCase();
            return haystack.indexOf(lower) !== -1;
        }).slice(0, 120);
        if (!matched.length) {
            results.innerHTML = "<div class="empty-state">没有找到匹配内容</div>";
            return;
        }
        results.innerHTML = "<div class="movie-grid">" + matched.map(createResultCard).join("") + "</div>";
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initSearchForms();
        initLocalFilter();
        initSearchPage();
    });
})();
