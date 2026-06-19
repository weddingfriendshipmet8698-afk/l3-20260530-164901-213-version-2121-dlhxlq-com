
import { H as Hls } from "./hls-dru42stk.js";

function preparePlayer() {
  var frame = document.querySelector(".player-frame");
  var video = document.querySelector(".movie-player");
  var button = document.querySelector(".player-button");

  if (!frame || !video || !button) {
    return;
  }

  var source = video.getAttribute("data-play") || "";

  if (source) {
    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    }
  }

  function updateState() {
    frame.classList.toggle("is-playing", !video.paused);
    button.textContent = video.paused ? "▶" : "❚❚";
  }

  button.addEventListener("click", function () {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", updateState);
  video.addEventListener("pause", updateState);
  video.addEventListener("ended", updateState);
  updateState();
}

if (document.readyState !== "loading") {
  preparePlayer();
} else {
  document.addEventListener("DOMContentLoaded", preparePlayer);
}
