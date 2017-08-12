  function VideoToCanvas(videoElement,fn) {
        if (!videoElement) {
            return;
        }
        var fn=fn||"";
        var canvas = document.createElement('canvas');
        canvas.width = videoElement.offsetWidth;
        canvas.height = videoElement.offsetHeight;
        var ctx = canvas.getContext('2d');
        var newVideo = videoElement.cloneNode(false);
        var timer = null;
        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
        function drawCanvas() {
            ctx.drawImage(newVideo, 0, 0, canvas.width, canvas.height);
            timer = requestAnimationFrame(drawCanvas);
        }
        function stopDrawing() {
            cancelAnimationFrame(timer);
        }
        function endedCallBack(){
             cancelAnimationFrame(timer);
             fn && fn()
        }
        newVideo.addEventListener('play', function () {
            drawCanvas();
        }, false);
        newVideo.addEventListener('pause', stopDrawing, false);
        newVideo.addEventListener('ended', endedCallBack, false);
        videoElement.parentNode.replaceChild(canvas, videoElement);
        this.play = function () {
            newVideo.play();
        };
        this.pause = function () {
            newVideo.pause();
        };
        this.playPause = function () {
            if (newVideo.paused) {
                this.play();
            } else {
                this.pause();
            }
        };
        this.change = function (src) {
            if (!src) {
                return;
            }
            newVideo.src = src;
        };
        this.drawFrame = drawCanvas;
        this.show = function () {
            canvas.style.display = "block";
        }
        this.hide = function () {
            canvas.style.display = "none";
        }
    }
