function initMoviePlayer(options) {
  var container = document.getElementById(options.containerId);
  var video = document.getElementById(options.videoId);
  if (!container || !video || !options.streamUrl) {
    return;
  }

  var cover = container.querySelector('.player-cover');
  var attached = false;
  var hlsInstance = null;

  function bindStream() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = options.streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(options.streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = options.streamUrl;
  }

  function startPlayback() {
    bindStream();
    container.classList.add('is-playing');
    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        container.classList.remove('is-playing');
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    container.classList.add('is-playing');
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('error', function () {
    container.classList.remove('is-playing');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
    }
  });
}
