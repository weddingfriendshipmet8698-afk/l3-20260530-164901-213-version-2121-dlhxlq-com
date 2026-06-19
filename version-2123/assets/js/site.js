(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  var filterPanel = document.querySelector('[data-local-filter]');
  if (filterPanel) {
    var textInput = filterPanel.querySelector('[data-filter-text]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-card]'));

    function applyLocalFilter() {
      var keyword = (textInput && textInput.value ? textInput.value : '').trim().toLowerCase();
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || (card.getAttribute('data-region') || '').indexOf(type) !== -1;
        card.style.display = matchKeyword && matchYear && matchType ? '' : 'none';
      });
    }

    [textInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyLocalFilter);
        control.addEventListener('change', applyLocalFilter);
      }
    });
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-layer');
    var hlsInstance = null;

    function prepareVideo() {
      if (!video || video.dataset.ready === '1') {
        return;
      }
      var source = video.getAttribute('data-src');
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      video.dataset.ready = '1';
    }

    function playVideo() {
      prepareVideo();
      player.classList.add('is-playing');
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.SEARCH_INDEX) {
    var form = searchPage.querySelector('[data-search-form]');
    var input = searchPage.querySelector('[data-search-input]');
    var yearFilter = searchPage.querySelector('[data-search-year]');
    var results = searchPage.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';

    if (input && queryFromUrl) {
      input.value = queryFromUrl;
    }

    function cardTemplate(item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster" href="' + item.url + '">',
        '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="poster-badge">' + item.year + '</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <a class="card-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="card-meta"><a href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.region) + '</span></div>',
        '    <div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
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
        .replace(/'/g, '&#39;');
    }

    function runSearch() {
      var keyword = (input && input.value ? input.value : '').trim().toLowerCase();
      var year = yearFilter ? yearFilter.value : '';
      var matched = window.SEARCH_INDEX.filter(function (item) {
        var text = [item.title, item.year, item.region, item.genre, item.category, item.tags.join(' ')].join(' ').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || String(item.year) === year;
        return matchKeyword && matchYear;
      }).slice(0, 96);

      if (!matched.length) {
        results.innerHTML = '<div class="empty-result">未找到匹配内容，请尝试更换关键词。</div>';
        return;
      }

      results.innerHTML = matched.map(cardTemplate).join('');
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        runSearch();
      });
    }

    [input, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runSearch);
        control.addEventListener('change', runSearch);
      }
    });

    if (queryFromUrl) {
      runSearch();
    }
  }
})();
