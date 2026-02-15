const VIDEO_ID = 'HnL2pXGPBZs';
const REDIRECT_URL = 'https://omar0216.github.io/Sara/';

let player;
let isVideoReady = false;

const introScreen = document.getElementById('intro-screen');
const btnVer = document.getElementById('btn-ver');
const videoContainer = document.getElementById('video-container');
const blackCurtain = document.getElementById('black-curtain');
const playerWrapper = document.getElementById('player-wrapper');

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: VIDEO_ID,
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'iv_load_policy': 3,
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0,
            'playsinline': 1,
            'enablejsapi': 1,
            'origin': window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    isVideoReady = true;
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        blackCurtain.style.opacity = '0';
        setTimeout(() => {
            blackCurtain.style.display = 'none';
        }, 500);
    }

    if (event.data === YT.PlayerState.ENDED) {
        window.location.href = REDIRECT_URL;
    }
}

btnVer.addEventListener('click', () => {
    if (!isVideoReady) return;

    requestFullScreenAndOrientation();

    introScreen.style.opacity = '0';
    setTimeout(() => {
        introScreen.classList.add('hidden');
        videoContainer.style.opacity = '1';
        
        player.unMute();
        player.setVolume(100);
        player.playVideo();
        
        resizePlayer();
    }, 800);
});

function resizePlayer() {
    if (!playerWrapper) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const windowRatio = w / h;
    const videoRatio = 16 / 9;

    let newWidth, newHeight;

    if (windowRatio > videoRatio) {
        newWidth = w;
        newHeight = w / videoRatio;
    } else {
        newHeight = h;
        newWidth = h * videoRatio;
    }

    playerWrapper.style.width = newWidth + 'px';
    playerWrapper.style.height = newHeight + 'px';
}

window.addEventListener('resize', resizePlayer);

function requestFullScreenAndOrientation() {
    const docEl = document.documentElement;

    if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => {});
    } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
    }

    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(err => {});
    }
}