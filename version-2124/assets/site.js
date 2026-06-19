(function () {
  var body = document.body;
  var basePrefix = body ? body.getAttribute('data-base-prefix') || '' : '';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var mobileNav = $('[data-mobile-nav]');

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      toggle.textContent = mobileNav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = $('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
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
      }, 5000);
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

  function initFilters() {
    $all('[data-filter-panel]').forEach(function (panel) {
      var gridSelector = panel.getAttribute('data-grid');
      var grid = gridSelector ? $(gridSelector) : null;
      var textInput = $('[data-filter-text]', panel);
      var yearSelect = $('[data-filter-year]', panel);
      var typeSelect = $('[data-filter-type]', panel);
      var reset = $('[data-filter-reset]', panel);
      var count = $('[data-filter-count]', panel);

      if (!grid) {
        return;
      }

      var cards = $all('[data-movie-card]', grid);

      function apply() {
        var query = textInput ? textInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute('data-search') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var match = true;

          if (query && text.indexOf(query) === -1) {
            match = false;
          }

          if (year && cardYear !== year) {
            match = false;
          }

          if (type && cardType !== type) {
            match = false;
          }

          card.style.display = match ? '' : 'none';

          if (match) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      if (textInput) {
        textInput.addEventListener('input', apply);
      }

      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }

      if (typeSelect) {
        typeSelect.addEventListener('change', apply);
      }

      if (reset) {
        reset.addEventListener('click', function () {
          if (textInput) {
            textInput.value = '';
          }

          if (yearSelect) {
            yearSelect.value = '';
          }

          if (typeSelect) {
            typeSelect.value = '';
          }

          apply();
        });
      }

      apply();
    });
  }

  function initGlobalSearch() {
    var input = $('[data-global-search]');
    var results = $('[data-global-results]');
    var data = window.SEARCH_DATA || [];

    if (!input || !results || !data.length) {
      return;
    }

    function close() {
      results.classList.remove('is-open');
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = '<a href="' + basePrefix + 'categories.html"><strong>没有找到相关影片</strong><span>进入分类页继续浏览</span></a>';
        results.classList.add('is-open');
        return;
      }

      results.innerHTML = items.map(function (item) {
        var href = basePrefix + item.url;
        return '<a href="' + href + '"><strong>' + item.title + '</strong><span>' + item.meta + '</span></a>';
      }).join('');
      results.classList.add('is-open');
    }

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();

      if (!query) {
        close();
        return;
      }

      var items = data.filter(function (item) {
        return item.search.indexOf(query) !== -1;
      }).slice(0, 12);

      render(items);
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) {
        input.dispatchEvent(new Event('input'));
      }
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('[data-search-box]')) {
        close();
      }
    });
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (player) {
      var video = $('video', player);
      var button = $('.player-start', player);
      var state = $('[data-player-state]', player);
      var src = player.getAttribute('data-src');
      var attached = false;
      var hls = null;
      var pendingPlay = false;

      if (!video || !src) {
        return;
      }

      function setState(text) {
        if (state) {
          state.textContent = text;
        }
      }

      function playVideo() {
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setState('点击播放器继续播放');
          });
        }
      }

      function attachSource(shouldPlay) {
        pendingPlay = !!shouldPlay;

        if (attached) {
          if (pendingPlay) {
            playVideo();
          }
          return;
        }

        attached = true;
        setState('正在加载播放源');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', function () {
            setState('点击播放');
            if (pendingPlay) {
              playVideo();
            }
          }, { once: true });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setState('点击播放');
            if (pendingPlay) {
              playVideo();
            }
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setState('视频加载失败，请稍后重试');
            }
          });
          return;
        }

        video.src = src;
        setState('当前浏览器不支持 HLS 播放');
      }

      function toggle() {
        if (!attached) {
          attachSource(true);
          return;
        }

        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener('click', toggle);
      }

      video.addEventListener('click', toggle);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });
      video.addEventListener('error', function () {
        setState('视频加载失败，请稍后重试');
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initGlobalSearch();
    initPlayers();
  });
}());
