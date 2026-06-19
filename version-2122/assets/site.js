(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", menu.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length === 0) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    slider.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var scopeSelector = form.getAttribute("data-filter-form");
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        scope = document;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var q = form.querySelector("[data-filter-q]");
      var region = form.querySelector("[data-filter-region]");
      var category = form.querySelector("[data-filter-category]");
      var type = form.querySelector("[data-filter-type]");
      var year = form.querySelector("[data-filter-year]");
      function apply() {
        var query = normalize(q && q.value);
        var selectedRegion = normalize(region && region.value);
        var selectedCategory = normalize(category && category.value);
        var selectedType = normalize(type && type.value);
        var selectedYear = normalize(year && year.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.textContent);
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (selectedRegion && normalize(card.getAttribute("data-region")) !== selectedRegion) {
            ok = false;
          }
          if (selectedCategory && normalize(card.getAttribute("data-category")) !== selectedCategory) {
            ok = false;
          }
          if (selectedType && normalize(card.getAttribute("data-type")) !== selectedType) {
            ok = false;
          }
          if (selectedYear && normalize(card.getAttribute("data-year")) !== selectedYear) {
            ok = false;
          }
          card.classList.toggle("is-filtered-out", !ok);
        });
      }
      [q, region, category, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (box) {
      var video = box.querySelector("video[data-hls]");
      var trigger = box.querySelector("[data-player-trigger]");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-hls");
      var prepared = false;
      var hls = null;
      function prepare() {
        if (prepared || !source) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      function play() {
        prepare();
        if (trigger) {
          trigger.classList.add("is-hidden");
        }
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }
      if (trigger) {
        trigger.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (trigger) {
          trigger.classList.add("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
