(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
        var current = 0;
        var timer = null;

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
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('is-active', thumbIndex === current);
            });
        }

        function startHero() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(index);
                startHero();
            });
        });

        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener('mouseenter', function () {
                showSlide(index);
            });
        });

        startHero();
    }

    function normalizeText(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupFilters(scope) {
        var searchInput = scope.querySelector('[data-card-search]');
        var regionFilter = scope.querySelector('[data-region-filter]');
        var typeFilter = scope.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
        var empty = document.querySelector('[data-empty-state]');

        if (!searchInput && !regionFilter && !typeFilter) {
            return;
        }

        function applyFilters() {
            var keyword = normalizeText(searchInput ? searchInput.value : '');
            var region = regionFilter ? regionFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalizeText(card.getAttribute('data-search'));
                var regionValue = card.getAttribute('data-region') || '';
                var typeValue = card.getAttribute('data-type') || '';
                var ok = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }

                if (region && regionValue.indexOf(region) === -1) {
                    ok = false;
                }

                if (type && typeValue.indexOf(type) === -1) {
                    ok = false;
                }

                card.classList.toggle('is-filtered-out', !ok);

                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [searchInput, regionFilter, typeFilter].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilters);
                field.addEventListener('change', applyFilters);
            }
        });
    }

    document.querySelectorAll('[data-filter-form]').forEach(setupFilters);

    var homeSearch = document.getElementById('homeSearch');

    if (homeSearch) {
        homeSearch.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                var target = './search.html?q=' + encodeURIComponent(homeSearch.value.trim());
                window.location.href = target;
            }
        });
    }

    var searchParams = new URLSearchParams(window.location.search);
    var query = searchParams.get('q');

    if (query) {
        var searchField = document.querySelector('[data-filter-form] [data-card-search]');
        if (searchField) {
            searchField.value = query;
            searchField.dispatchEvent(new Event('input'));
        }
    }

    var activePlayers = new WeakMap();

    function startPlayer(box) {
        var video = box.querySelector('.player-video');
        var button = box.querySelector('.play-trigger');
        var cover = box.querySelector('.player-cover');
        var status = box.querySelector('.player-status');
        var stream = button ? button.getAttribute('data-stream') : '';

        if (!video || !stream) {
            return;
        }

        if (status) {
            status.hidden = true;
            status.textContent = '';
        }

        function showError(message) {
            if (status) {
                status.textContent = message;
                status.hidden = false;
            }
        }

        function playVideo() {
            video.controls = true;
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var task = video.play();
            if (task && typeof task.catch === 'function') {
                task.catch(function () {
                    showError('请再次点击播放');
                });
            }
        }

        if (!activePlayers.has(video) && !video.getAttribute('src')) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.setAttribute('src', stream);
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                video.load();
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                activePlayers.set(video, hls);
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        showError('视频加载失败，请稍后重试');
                    }
                });
            } else {
                showError('您的浏览器暂不支持此视频格式');
            }
        } else {
            playVideo();
        }
    }

    document.querySelectorAll('[data-player]').forEach(function (box) {
        var button = box.querySelector('.play-trigger');
        var video = box.querySelector('.player-video');

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayer(box);
            });
        }

        box.addEventListener('click', function (event) {
            if (event.target.closest('.play-trigger')) {
                return;
            }
            if (event.target.closest('a')) {
                return;
            }
            startPlayer(box);
        });

        if (video) {
            video.addEventListener('play', function () {
                var cover = box.querySelector('.player-cover');
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
        }
    });
})();
