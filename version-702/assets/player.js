(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        document.querySelectorAll("[data-player-src]").forEach(function (stage) {
            var video = stage.querySelector("video");
            var button = stage.querySelector(".player-start");
            var src = stage.getAttribute("data-player-src");
            var loaded = false;
            var hls = null;

            function attachSource() {
                if (loaded || !video || !src) {
                    return;
                }

                loaded = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
            }

            function start() {
                attachSource();
                stage.classList.add("is-playing");

                var result = video.play();
                if (result && result.catch) {
                    result.catch(function () {
                        stage.classList.remove("is-playing");
                    });
                }
            }

            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    start();
                });
            }

            stage.addEventListener("click", function (event) {
                if (event.target === stage || event.target.classList.contains("player-poster")) {
                    start();
                }
            });

            video.addEventListener("play", function () {
                stage.classList.add("is-playing");
            });

            video.addEventListener("ended", function () {
                if (hls) {
                    hls.stopLoad();
                }
            });
        });
    });
})();
