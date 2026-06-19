(function () {
  var video = document.getElementById('moviePlayer');
  var layer = document.getElementById('playLayer');
  var sourceElement = document.getElementById('player-source');

  if (!video || !layer || !sourceElement) {
    return;
  }

  var config = JSON.parse(sourceElement.textContent || '{}');
  var sourceUrl = config.url || '';
  var attached = false;
  var hls = null;

  function attach() {
    if (attached || !sourceUrl) {
      return;
    }

    attached = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    }
  }

  function start() {
    attach();
    layer.classList.add('is-hidden');
    var playing = video.play();

    if (playing && typeof playing.catch === 'function') {
      playing.catch(function () {});
    }
  }

  layer.addEventListener('click', start);

  video.addEventListener('click', function () {
    if (!attached) {
      start();
    }
  });

  video.addEventListener('play', function () {
    layer.classList.add('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
