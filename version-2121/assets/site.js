(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");

        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
                menuButton.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var activeSlide = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeSlide = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeSlide);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeSlide);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            showSlide(0);
            setInterval(function () {
                showSlide(activeSlide + 1);
            }, 5000);
        }

        var filterInput = document.querySelector("[data-search-input]");
        var typeSelect = document.querySelector("[data-type-filter]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }

            var keyword = normalize(filterInput ? filterInput.value : "");
            var typeValue = normalize(typeSelect ? typeSelect.value : "");
            var yearValue = normalize(yearSelect ? yearSelect.value : "");
            var visibleCount = 0;

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute("data-title"));
                var region = normalize(card.getAttribute("data-region"));
                var genre = normalize(card.getAttribute("data-genre"));
                var tags = normalize(card.getAttribute("data-tags"));
                var type = normalize(card.getAttribute("data-type"));
                var year = normalize(card.getAttribute("data-year"));
                var matchKeyword = !keyword || title.indexOf(keyword) >= 0 || region.indexOf(keyword) >= 0 || genre.indexOf(keyword) >= 0 || tags.indexOf(keyword) >= 0;
                var matchType = !typeValue || type.indexOf(typeValue) >= 0;
                var matchYear = !yearValue || year === yearValue;
                var visible = matchKeyword && matchType && matchYear;

                card.classList.toggle("is-hidden", !visible);

                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-hidden", visibleCount !== 0);
            }
        }

        [filterInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });
})();

(function () {
    function init(playerId, sourceUrl) {
        var player = document.getElementById(playerId);

        if (!player) {
            return;
        }

        var video = player.querySelector("video");
        var cover = player.querySelector(".player-cover");
        var playButtons = Array.prototype.slice.call(player.querySelectorAll("[data-play-button]"));
        var hlsInstance = null;
        var hasLoaded = false;

        function loadVideo() {
            if (!video || hasLoaded) {
                return;
            }

            hasLoaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            }
        }

        function startVideo() {
            loadVideo();

            if (cover) {
                cover.classList.add("is-hidden");
            }

            if (video) {
                video.setAttribute("controls", "controls");
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        if (cover) {
                            cover.classList.remove("is-hidden");
                        }
                    });
                }
            }
        }

        playButtons.forEach(function (button) {
            button.addEventListener("click", startVideo);
        });

        if (cover) {
            cover.addEventListener("click", startVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    startVideo();
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.MovieSitePlayer = {
        init: init
    };
})();
