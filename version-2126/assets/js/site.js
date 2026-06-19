
(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var navButton = document.querySelector(".mobile-toggle");
    var navLinks = document.querySelector(".nav-links");

    if (navButton && navLinks) {
      navButton.addEventListener("click", function () {
        navLinks.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector(".hero-panel");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-current", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-current", dotIndex === current);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var regionSelect = document.querySelector("[data-region-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".empty-state");

    function normalize(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function applyFilters() {
      var keyword = normalize(filterInput ? filterInput.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var pool = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var passKeyword = !keyword || pool.indexOf(keyword) !== -1;
        var passYear = !year || card.getAttribute("data-year") === year;
        var passRegion = !region || card.getAttribute("data-region") === region;
        var pass = passKeyword && passYear && passRegion;

        card.style.display = pass ? "" : "none";
        if (pass) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.style.display = visibleCount === 0 ? "block" : "none";
      }
    }

    if (filterInput || yearSelect || regionSelect) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && filterInput) {
        filterInput.value = q;
      }
      [filterInput, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });
      applyFilters();
    }
  });
})();
